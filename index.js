const fs = require('fs');
const _ = require('lodash');

const logger = require('./src/logger');
const github = require('./src/github/index');
const githubData = require('./src/github/data');
const gephy = require('./src/gephy');

/*github
    .run([
        'tamediadigital',
        'CERN',
        'Roche',
        'swisscom',
        'Zuehlke',
        'SchweizerischeBundesbahnen',
        'adfinis-sygroup',
        'srfdata',
        '20Minuten',
        'nzzdev',
        'FHNW',
        'local-ch',
        'migros',
        'tutti-ch',
        'softwarebrauerei',
        'swisstxt',
        'ventoo',
        'wireapp',
        'admin-ch',
        'opendata-swiss',
        'swissmedical',
        'swisspush',
        'swiss-virtual',
        'cyon',
        'METANETAG',
        'axa-ch',
        'vshn',
        'alv-ch',
        'ogdch',
        'geoadmin'
    ], (data) => {
        logger.info('[Crawler] Finished');
        gephy.createFile(githubData.getAll());
    });
*/

/**
 * Test Gepy
 */
 fs.readFile('./data/2016-11-11.json', 'utf8', (err, data) => {
     if (err) throw err; // we'll not consider error handling for now
     var obj = JSON.parse(data);
     gephy.createFile(obj);
 });