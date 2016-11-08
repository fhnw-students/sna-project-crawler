const request = require('request');
const _ = require('lodash');

const logger = require('./logger');

const clientId = "49ef8fc6320cc83640b6";
const clientSecret = "b0734f6c9c1a28472ee2a03151e204c3621a1e4a";

let users = [];
let limit = 100;
let counter = 0;

exports.run = (_login, _limit) => {
	return new Promise((resolve, reject) => {
		limit = _limit;
		getUser(_login)
			.then(() => resolve(users))
			.catch(logger.error);
	});
};

const getUser = (login) => {
	return new Promise((resolve, reject) => {
		if (counter < limit && !isUserAlreadyCrawled(login)) {
			counter++;
			logger.info('[getUser]', login, counter + '/' + limit);
			requestUser(login)
				.then(user => addUser(user.login, user.name))
				.then(user => Promise.all([
					addFollowers(user),
					addLangs(user)
				]))
				.then(a => a[0])
				.then(user => {
					if (counter < limit) {
						return Promise.all(
							user.followers.map((followerLogin) => getUser(followerLogin))
						)
					} else {
						return user;
					}
				})
				.then(resolve)
				.catch(reject);
		} else {
			resolve({});
		}
	});
};

const isUserAlreadyCrawled = (login) => {
	let logins = users.map(user => user.login);
	return logins.indexOf('login') >= 0;
};

const addUser = (login, fullname) => {
	let user = {
		login: login,
		fullname: fullname,
		langs: [],
		followers: []
	};
	users.push(user);
	return user
};

const addFollowers = (user) => {
	return requestUserFollowers(user.login)
		.then(followers => followers.map(f => f.login))
		.then(followers => {
			user.followers = followers;
			return user;
		});
};

const addLangs = (user) => {
	return requestUserRepos(user.login)
		.then(repos => {
			let queue = [];
			repos.forEach((repo) => {
				queue.push(requestUsersRepoLangs(user.login, repo.name));
			});
			return Promise.all(queue);
		})
		.then(a => _(a).map(_.keys).flattenDeep().union().value())
		.then((langs) => {
			user.langs = langs;
			return user;
		});
};

const requestUser = (login) => {
	return _request('/users/' + login);
};

const requestUserRepos = (login) => {
	return _request('/users/' + login + '/repos');
};

const requestUsersRepoLangs = (login, repo) => {
	return _request('/repos/' + login + '/' + repo + '/languages');
};

const requestUserFollowers = (login) => {
	return _request('/users/' + login + '/followers');
};

const _request = (path) => {
	return new Promise((resolve, reject) => {
		request(getRequestOptions(path), (error, response, body) => {
			logger.info('[HTTP]', response.statusCode + ' GET ' + path);
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			} else {
				reject({
					error: error,
					status: response.statusCode,
				});
			}
		});
	});
};

//////////////////////////////////////////////////////////////////


// const getUser = (userLogin) => {
// 	return new Promise((resovle, reject) => {
// 		request(getRequestOptions('/users/' + userLogin), (error, response, body) => {
// 			if (!error && response.statusCode == 200) {
// 				resovle(JSON.parse(body));
// 			} else {
// 				reject({
// 					error: error,
// 					status: response.statusCode,
// 				});
// 			}
// 		});
// 	});
// }

// const getUsersRepos = (userLogin) => {
// 	return new Promise((resovle, reject) => {
// 		request(getRequestOptions('/users/' + userLogin + '/repos'), (error, response, body) => {
// 			if (!error && response.statusCode == 200) {
// 				resovle(JSON.parse(body));
// 			} else {
// 				reject({
// 					error: error,
// 					status: response.statusCode,
// 				});
// 			}
// 		});
// 	});
// }

// ///repos/hirsch88/angular-bootstrap-slider/languages
// const getUserRepoLang = (userLogin, repoName) => {
// 	return new Promise((resovle, reject) => {
// 		request(getRequestOptions('/repos/' + userLogin + '/' + repoName + '/languages'), (error, response, body) => {
// 			if (!error && response.statusCode == 200) {
// 				resovle(JSON.parse(body));
// 			} else {
// 				reject({
// 					error: error,
// 					status: response.statusCode,
// 				});
// 			}
// 		});
// 	});
// }

// const getRepos = (done) => {
// 	return new Promise((resovle) => {
// 		request(getRequestOptions('/repositories'), (error, response, body) => {
// 			if (!error && response.statusCode == 200) {
// 				done(JSON.parse(body));
// 			}
// 		});
// 	});
// }

/////////////////////////////////////////////////////////////////////////

const getAuthParams = () => {
	return `?client_id=${clientId}&client_secret=${clientSecret}`;
};

const getRequestOptions = (path) => {
	return {
		url: 'https://api.github.com' + path + getAuthParams(),
		headers: {
			'User-Agent': 'request'
		}
	}
};