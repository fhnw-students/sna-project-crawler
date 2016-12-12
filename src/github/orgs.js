const _ = require('lodash');

const githubRequest = require('./request');
const githubData = require('./data');
const taskRunner = require('./task-runner');
const logger = require('../logger');

let users = [];

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
    return done();
  }
  users.push(user.login);

  githubRequest
    .getUser(user.login)
    .then((userData) => {
      user.description = userData.name;

      // 1. get repo from the user
      taskRunner.add(`User(${user.login}).Repo`, getUserRepos(index));

      // 2. get followers of this user -> org
      taskRunner.add(`User(${user.login}).Followers`, getUserFollowers(index));

    })
    .then(done)
    .catch(done);
};

const getOrgsRepoLangs = (index, repoName) => {
  return (done) => {
    let org = githubData.get(index);
    githubRequest
      .getRepoLangs(org.login, repoName)
      .then(langs => githubData.addLangs(index, _.keys(langs)))
      .then(githubData.save())
      .then(done)
      .catch(done);
  };
};

const getUserRepoLangs = (index, repoName) => {
  return (done) => {
    let user = githubData.get(index);
    githubRequest
      .getRepoLangs(user.login, repoName)
      .then(langs => githubData.addLangs(index, _.keys(langs)))
      .then(githubData.save())
      .then(done)
      .catch(done);
  };
};
const getContributerRepoLangs = (index, org, repoName) => {
  return (done) => {
    let user = githubData.get(index);
    githubRequest
      .getRepoLangs(org.login, repoName)
      .then(langs => githubData.addLangs(index, _.keys(langs)))
      .then(githubData.save())
      .then(done)
      .catch(done);
  };
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
          taskRunner.add(`Org(${c.login}).Repo(${repoName}).getLangs()`, getContributerRepoLangs(idx, org, repoName));

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
