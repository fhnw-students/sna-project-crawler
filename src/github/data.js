const _ = require('lodash');
const fs = require('fs');

const logger = require('../logger');

const PATH = 'data';
const now = new Date();
const buildFilename = () => {
  return `${PATH}/cyon-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.json`;
};

const Node = (type, login, description) => ({
  login: login,
  description: description,
  type: type,
  repos: [],
  langs: [],
  organisations: [],
  contributers: [],
  followers: []
});

const Organisation = (login, description) => Node('Organisation', login, description);
const User = (login, description) => Node('User', login, description);

let data = [];

const mergeArrays = (a, b) => _.uniq(_.concat(a, b));

const getIndexOf = (login) => {
  let logins = data.map(d => d.login);
  return logins.indexOf(login);
};

const isNodeAlreadyCrawled = (login) => getIndexOf(login) >= 0;

exports.getAll = () => data;

exports.get = (index) => data[index];

exports.has = (login) => isNodeAlreadyCrawled(login);

const add = (newNode) => {
  if (isNodeAlreadyCrawled(newNode.login)) {
    return getIndexOf(newNode.login);
  } else {
    return data.push(newNode) - 1;
  }
};

const writeJsonFile = () => {
  return new Promise((resolve, reject) => {
    let filename = buildFilename();
    fs.writeFile(filename, JSON.stringify(data), (err) => {
      if (err) return logger.error(err);
      resolve();
    });
  });
};

exports.save = writeJsonFile;

exports.addUser = (login, description) => add(User(login, description));
exports.addOrganisation = (login, description) => add(Organisation(login, description));

exports.addLangs = (i, as) => data[i].langs = mergeArrays(data[i].langs, as);
exports.addRepos = (i, as) => data[i].repos = mergeArrays(data[i].repos, as.map(r => r.name));
exports.addFollowers = (i, as) => data[i].followers = mergeArrays(data[i].followers, as.map(f => f.login));
exports.addContributors = (i, as) => data[i].contributers = mergeArrays(data[i].contributers, as.map(c => c.login));
exports.addOrganisations = (i, as) => data[i].organisations = mergeArrays(data[i].organisations, as.map(o => o.login));
