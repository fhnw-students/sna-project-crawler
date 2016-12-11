const _ = require('lodash');

const githubOrgs = require('./orgs');
const taskRunner = require('./task-runner');
const githubData = require('./data');
const logger = require('../logger');

exports.run = (orgs, done) => {
    logger.info('[Github] Starting');
    taskRunner.onFinished(() => done(githubData.getAll()));
    orgs.forEach((o) => {
        taskRunner.add(`Org(${o})`, githubOrgs.getTask(o));
    });
    taskRunner.start();
};
