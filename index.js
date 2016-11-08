const prompt = require('prompt');
const fs = require('fs');

const logger = require('./src/logger');
const github = require('./src/github');
const gephy = require('./src/gephy');
const _ = require('lodash');

prompt.start();
prompt.get([
    {
        name: 'githubName',
        description: 'Enter a github username',
        type: 'string',
        required: true
    },
    {
        name: 'limit',
        description: 'How many users should be crawled?',
        type: 'number',
        required: true
    }
], (err, results) => {
    if (!_.isNumber(results.limit)) {
        logger.error('Please enter a valid number for limit');
    } else {
        logger.info('[Crawler] Starting for user ' + results.githubName);
        github
            .run(results.githubName, results.limit)
            .then((users) => {
                logger.info('[Crawler] Finished');
                fs.writeFile('users.json', JSON.stringify(users), (err) => {
                    if (err) return logger.error(err);
                    logger.info('[Data] > users.json');
                });

                //gephy.createFile(users);
            })
            .catch(logger.error);
    }
});
