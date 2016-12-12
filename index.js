const fs = require('fs');
const _ = require('lodash');

const logger = require('./src/logger');
const github = require('./src/github/index');
const githubData = require('./src/github/data');
const gephy = require('./src/gephy');

github
    .run([
        'fhnw-students',
        'w3tecch'
    ], (data) => {
        logger.info('[Crawler] Finished');
        gephy.createFile(githubData.getAll());
    });
