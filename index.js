const fs = require('fs');

const logger = require('./src/logger');
const github = require('./src/github');
const gephy = require('./src/gephy');

logger.info('[Crawler] Starting');
github
    .run('hirsch88', 12)
    .then((users) => {
        logger.info('[Crawler] Finished');
        fs.writeFile('users.json', JSON.stringify(users), (err) => {
            if (err) return logger.error(err);
            logger.info('[Data] > users.json');
        });

        gephy.createFile(users);
    })
    .catch(logger.error);

