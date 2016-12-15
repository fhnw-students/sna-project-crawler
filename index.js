const fs = require('fs');
const _ = require('lodash');

const logger = require('./src/logger');
const github = require('./src/github/index');
const githubData = require('./src/github/data');
const gephy = require('./src/gephy');

github
    .run([
        // 'tamediadigital', // 3883 in 78.88895000000001 min
        // 'CERN', // 273 5.243033333333333 min
        // 'Roche', // 1830 32.601483333333334 min
        // 'swisscom', // 3293 58.06623333333334 min
        // 'Zuehlke', // 1370 25.068916666666667 min
        // 'SchweizerischeBundesbahnen', // 3727 43.10825 min
        // 'adfinis-sygroup', // 644 6.996383333333333 min
        // 'srfdata', // 989 11.478250000000001 min
        // '20Minuten', // 20 0.23249999999999998 min
        // 'nzzdev', // 5010 58.66296666666666 min
        // 'FHNW', // 4915 39.98151666666667 min
        // 'local-ch', 7437 66.4064 min
        // 'migros', // 2440 20.562066666666666 min
        // 'tutti-ch', // 380 5.3346 min
        // 'softwarebrauerei', // 27 0.16568333333333335 min
        // 'swisstxt', // 2597 20.9498 min
        // 'ventoo', // 686 5.4793666666666665 min
        // 'wireapp', // 2417 18.334966666666666 min
        // 'admin-ch', ERROR 443
        // 'opendata-swiss', // 659 5.145083333333333 min
        // 'swissmedical', // 168 1.3076833333333333 min
        // 'swisspush', // 941 7.450950000000001 min
        // 'swiss-virtual', // 272 2.23 min
        // 'cyon', // 3199 27.786116666666665 min
        // 'METANETAG', // 793 6.594383333333334 min
        'axa-ch',
        // 'vshn',
        // 'alv-ch',
        // 'ogdch',
        // 'geoadmin'
    ], (data) => {
        logger.info('[Crawler] Finished');
    });
