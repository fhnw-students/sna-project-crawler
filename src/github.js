const request = require('request');
const _ = require('lodash');

const logger = require('./logger');

const clientId = "49ef8fc6320cc83640b6";
const clientSecret = "b0734f6c9c1a28472ee2a03151e204c3621a1e4a";

const GITHUB_REQUEST_LIMIT_PER_MS = (60 * 60 * 1000) / 5000;

// const clientId = "104e961db0a813bb5941";
// const clientSecret = "324cb05d0a683b51984ae2ae392648bcf93d1010";

let users = [];
let limit = 100;
let counter = 0;
let counterRequest = 0;
let taskId = 0;
let queue = [];
let done;
let start = new Date();

const addTask = (message, task) => {
	return queue.push({
		id: taskId++,
		message: message,
		run: task
	}) - 1;
};

const mergeLangs = (a, b) => _.uniq(_.concat(a, b));
const getUser = (i) => users[i];
const updateUser = (i, newUser) => users[i] = newUser;

const nextTask = () => {
	let task = queue.shift();
	if (task && _.isFunction(task.run)) {
		logger.info(`[TASK-${task.id}] Starting`, task.message);
		task.run(() => {
			logger.info(`[TASK-${task.id}] Finished`, queue.length);
			nextTask();
		});
	} else {
		let now = new Date();
		logger.info('[Github] Finished ' + counterRequest + ' in ' + (Math.abs(now - start) / 1000) / 60 + 'sec');
		if (_.isFunction(done)) {
			done(users);
		}
	}
};

const getUserTask = (login) => {
	return (done) => {

		if (counter >= limit || isUserAlreadyCrawled(login)) {
			logger.info('[USER] Limit reached! ', counter + '/' + limit);
			return done();
		}

		requestUser(login).then((user) => {
			let index = addUser(user);
			addTask(`User(${user.login}).getRepos()`, getUserRepos(index));
			addTask(`User(${user.login}).getFollowers()`, getUserFollowers(index));
			done();
			return;
		});

	};
};

const getUserRepos = (index) => (done) => {
	let user = getUser(index);
	requestUserRepos(user.login).then((repos) => {
		repos.forEach((repo) => {
			addTask(`User(${user.login}).Repo(${repo.name}).getLangs()`, getUserLangs(index, repo.name));
		});
		done();
		return;
	}).catch(done);
};

const getUserLangs = (index, repo) => (done) => {
	let user = getUser(index);
	requestUsersRepoLangs(user.login, repo).then((langs) => {
		user.langs = mergeLangs(user.langs, _.keys(langs));
		updateUser(index, user);
		done();
		return;
	}).catch(done);
};

const getUserFollowers = (index) => (done) => {
		let user = getUser(index);
		requestUserFollowers(user.login).then((followers) => {
		user.followers = followers.map(f => f.login);
		updateUser(index, user);
		user.followers.forEach(u => {
			addTask(`User(${user.login}).Follower(${u})`, getUserTask(u));
		});
		done();
		return;
		}).catch(done);
};

const isUserAlreadyCrawled = (login) => {
	let logins = users.map(user => user.login);
	return logins.indexOf('login') >= 0;
};

const addUser = (u) => {
	counter++;
	let user = {
		login: u.login,
		fullname: u.fullname,
		langs: [],
		followers: []
	};
	return users.push(user) - 1;
};

/////////////////////////////////////////////////////////////////////////

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
		logger.debug('[REQUEST] ' + (++counterRequest));
		setTimeout(() => {
			request(getRequestOptions(path), (error, response, body) => {
				let statusCode = 0;
				if (error) {
					logger.error(`[HTTP]`, path, error, body);
				}
				if (response && response.statusCode) {
					statusCode = response.statusCode;
					logger.debug('[HTTP]', response.statusCode + ' GET ' + path);
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
		}, GITHUB_REQUEST_LIMIT_PER_MS);
	});
};

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

/////////////////////////////////////////////////////////////////////////

exports.run = (_login, _limit, _done) => {
		limit = _limit;
		done = _done;
		logger.info('[Github] Starting');
		addTask(`User(${_login})`, getUserTask(_login));
		nextTask();
};
