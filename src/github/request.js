const _ = require('lodash');
const request = require('request');

const logger = require('../logger');

/**
 * Github Clients
 */
let clientCounter = 0;
const clients = [
	{
		id: "49ef8fc6320cc83640b6",
		secret: "b0734f6c9c1a28472ee2a03151e204c3621a1e4a",
	}, {
		id: "104e961db0a813bb5941",
		secret: "324cb05d0a683b51984ae2ae392648bcf93d1010",
	}, {
		id: "56d7e665339a1413bd8a",
		secret: "14f321931129a3d516e8faa78e589fbebc7dc154",
	}, {
		id: "739012d923bd28103136",
		secret: "6c6afbd259ee58713094a70dcd37cecca544771d",
	}
];
/**
 * This is the pause we need to do between each requst to avoid the requst-limit
 */
const GITHUB_REQUEST_LIMIT_PER_MS = ((60 * 60 * 1000) / 5000) / clients.length;
/**
 * Counts the requests
 */
let counterRequest = 0;
/**
 * Returns the client uri parameters for the upcoming request
 */
const getAuthParams = () => {
	if (clientCounter < clients.length - 1) {
		clientCounter++;
	} else {
		clientCounter = 0;
	}
	return `?client_id=${clients[clientCounter].id}&client_secret=${clients[clientCounter].secret}`;
};
/**
 * Builds and returns a default requst header
 */
const getRequestOptions = (path) => {
	return {
		url: 'https://api.github.com' + path + getAuthParams(),
		headers: {
			'User-Agent': 'request'
		}
	}
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

exports.getUser = (login) => {
	return _request('/users/' + login);
};

exports.getOrg = (login) => {
	return _request('/orgs/' + login);
};

exports.getOrgsRepos = (login) => {
	return _request('/orgs/' + login + '/repos');
};

exports.getRepoLangs = (ownerLogin, repo) => {
	return _request('/repos/' + ownerLogin + '/' + repo + '/languages');
};

exports.getOrgsRepoContributors = (login, repo) => {
	return _request('/repos/' + login + '/' + repo + '/contributors');
};

exports.getUserRepos = (login) => {
	return _request('/users/' + login + '/repos');
};

exports.getUserFollowers = (login) => {
	return _request('/users/' + login + '/followers');
};
