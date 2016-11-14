const request = require('request');
const _ = require('lodash');

const logger = require('./logger');

const clientId = "49ef8fc6320cc83640b6";
const clientSecret = "b0734f6c9c1a28472ee2a03151e204c3621a1e4a";

// const clientId = "104e961db0a813bb5941";
// const clientSecret = "324cb05d0a683b51984ae2ae392648bcf93d1010";

let users = [];
let limit = 100;
let counter = 0;
let queue = [];
let done;

exports.run = (_login, _limit, _done) => {
		limit = _limit;
		done = _done;
		logger.info('[Github] Starting');
		queue.push(getUser(_login));
		next();
};

const next = (_login, _limit) => {
	return new Promise((resolve, reject) => {
		if (counter < limit && queue.length !== 0) {
			logger.info('[TASK] Starting', queue.length);
			let task = queue.shift();
			if (_.isFunction(task)) {
				task()
					.then(() => {
						logger.info('[TASK] Finished');
						return next();
					})
					.catch((e) => {
						logger.error('[TASK] Error', e);
					});
			} else {
				next();
			}
		} else {
			logger.info('[Github] Finished');
			if (done) {
				done(users);
			}
			resolve();
		}
	});
};

const getUser = (login) => {
	return function () {
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
							user.followers.forEach((followerLogin) => {
								addTask(followerLogin, getUser(followerLogin));
							});
							return user;
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
	}
};

const addTask = (login, task) => {
	if (!isUserAlreadyCrawled(login)) {
		queue.push(task);
	}
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
			let statusCode = 0;
			if (error) {
				logger.error(`[HTTP]`, path, error, body);
			}
			if (response && response.statusCode) {
				statusCode = response.statusCode;
				logger.info('[HTTP]', response.statusCode + ' GET ' + path);
			} else {
				logger.warn(`[HTTP]`, path, error, response, body);
			}
			if (!error && statusCode == 200) {
				resolve(JSON.parse(body));
			} else {
				reject({
					error: error,
					status: statusCode,
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