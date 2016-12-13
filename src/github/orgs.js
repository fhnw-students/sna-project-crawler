const _ = require('lodash');

const githubRequest = require('./request');
const githubData = require('./data');
const taskRunner = require('./task-runner');
const logger = require('../logger');

let users = [];
let repos = {};
let countUserDublicates = 0;
let countRepoDublicates = 0;

const buildKey = (login, repoName) => `${login}__${repoName}`;

const getRepo = (login, repoName) => {
  let langs = repos[buildKey(login, repoName)];
  if (_.isArray(langs)) {
    return langs;
  }
  return false;
};

const addRepo = (login, repoName, langs) => {
  repos[buildKey(login, repoName)] = langs;
};

const getUserFollowers = (index) => (done) => {
  let user = githubData.get(index);
  githubRequest
    .getUserFollowers(user.login)
    .then((followers) => githubData.addFollowers(index, followers))
    .then(done)
    .catch(done);
};

const getUserRepos = (index) => (done) => {
  let user = githubData.get(index);
  githubRequest
    .getUserRepos(user.login)
    .then(repos => {
      githubData.addRepos(index, repos);
      repos.forEach((repo) => {

        // 1. get lang of the users repos
        taskRunner.add(`User(${user.login}).Repo(${repo.name}).getLangs()`, getUserRepoLangs(index, repo.name));

      });
    })
    .then(done)
    .catch(done);
};

const getUser = (index) => (done) => {
  let user = githubData.get(index);
  if (users.indexOf(user.login) >= 0) {
    logger.warn(`[USER] "${user.login}" already fetchted! `, ++countUserDublicates);
    return done();
  }
  users.push(user.login);

  githubRequest
    .getUser(user.login)
    .then((userData) => {
      user.description = userData.name;

      // 1. get repo from the user
      taskRunner.add(`User(${user.login}).getRepos()`, getUserRepos(index));

      // 2. get followers of this user -> org
      taskRunner.add(`User(${user.login}).getFollowers()`, getUserFollowers(index));

    })
    .then(done)
    .catch(done);
};

const getRepoLangs = (index, login, repoName) => (done) => {
  let repoLangs = getRepo(login, repoName);
  if (repoLangs === false) {
    githubRequest
      .getRepoLangs(login, repoName)
      .then(langs => _.keys(langs))
      .then(langs => {
        githubData.addLangs(index, langs);
        addRepo(login, repoName, langs);
      })
      .then(githubData.save())
      .then(done)
      .catch(done);
  } else {
    logger.warn(`[REPO] "${repoName}" already fetchted! `, ++countRepoDublicates);
    githubData.addLangs(index, repoLangs);
    githubData.save()
      .then(done)
      .catch(done);
  }
};

const getOrgsRepoLangs = (index, repoName) => (done) => {
  let org = githubData.get(index);
  getRepoLangs(index, org.login, repoName)(done);
};

const getUserRepoLangs = (index, repoName) => (done) => {
  let user = githubData.get(index);
  getRepoLangs(index, user.login, repoName)(done);
};

const getContributerRepoLangs = (index, org, repoName) => (done) => {
  getRepoLangs(index, org.login, repoName)(done);
};

const getRepoContributers = (index, repoName) => {
  return (done) => {
    let org = githubData.get(index);
    githubRequest
      .getOrgsRepoContributors(org.login, repoName)
      .then(contributors => {
        githubData.addContributors(index, contributors);
        contributors.forEach(c => {
          let idx = githubData.addUser(c.login, c.fullname);
          githubData.addOrganisations(idx, [org]);

          // 1. get reops from this org
          taskRunner.add(`Org(${org.login}).Repo(${repoName}).Contributer(${c.login}).getLangs()`, getContributerRepoLangs(idx, org, repoName));

          // 2. get user infos like fullname and other orgs
          taskRunner.add(`User(${c.login})`, getUser(idx));

        });
      })
      .then(githubData.save())
      .then(done)
      .catch(done);
  };
};

const getOrgRepos = (index) => {
  return (done) => {
    let org = githubData.get(index);
    githubRequest
      .getOrgsRepos(org.login)
      .then((repos) => {
        githubData.addRepos(index, repos);
        repos.forEach((repo) => {

          // 1. get lang of all repos
          taskRunner.add(`Org(${org.login}).Repo(${repo.name}).getLangs()`, getOrgsRepoLangs(index, repo.name));

          // 2. get contributers -> repo -> langs
          taskRunner.add(`Org(${org.login}).Repo(${repo.name}).getContributers()`, getRepoContributers(index, repo.name));

        });
      })
      .then(githubData.save())
      .then(done)
      .catch(done);
  };
};

exports.getTask = (orgLogin) => {
  return (done) => {
    githubRequest
      .getOrg(orgLogin)
      .then((org) => {
        let index = githubData.addOrganisation(org.login, org.description);

        //  1. get all repos of repo -> lang and contributers -> repo -> langs
        taskRunner.add(`Org(${org.login}).getRepos()`, getOrgRepos(index));

      })
      .then(githubData.save())
      .then(done)
      .catch(done);
  };
};
