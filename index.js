const fs = require('fs');
const _ = require('lodash');

const logger = require('./src/logger');
const github = require('./src/github/index');
const githubData = require('./src/github/data');
const gephy = require('./src/gephy');

github
    .run([
        //'tamediadigital', // 3883 in 78.88895000000001 min
        // 'CERN', // 273 5.243033333333333 min
        'Roche',
        // 'swisscom',
        // 'Zuehlke',
        // 'SchweizerischeBundesbahnen',
        // 'adfinis-sygroup',
        // 'srfdata',
        // '20Minuten',
        // 'nzzdev',
        // 'FHNW',
        // 'local-ch',
        // 'migros',
        // 'tutti-ch',
        // 'softwarebrauerei',
        // 'swisstxt',
        // 'ventoo',
        // 'wireapp',
        // 'admin-ch',
        // 'opendata-swiss',
        // 'swissmedical',
        // 'swisspush',
        // 'swiss-virtual',
        // 'cyon',
        // 'METANETAG',
        // 'axa-ch',
        // 'vshn',
        // 'alv-ch',
        // 'ogdch',
        // 'geoadmin'
    ], (data) => {
        logger.info('[Crawler] Finished');
    });
