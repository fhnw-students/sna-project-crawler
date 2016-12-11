const _ = require('lodash');
const request = require('request');

const logger = require('../logger');

/**
 *
 */
const clientId = "49ef8fc6320cc83640b6";
const clientSecret = "b0734f6c9c1a28472ee2a03151e204c3621a1e4a";
/**
 *
 */
const GITHUB_REQUEST_LIMIT_PER_MS = (60 * 60 * 1000) / 5000;
/**
 *
 */
let counterRequest = 0;

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

exports.getUserOrgs = (login) => {
	return _request('/users/' + login + '/orgs');
};

exports.getUserFollowers = (login) => {
	return _request('/users/' + login + '/followers');
};
