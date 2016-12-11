const fs = require('fs');
const _ = require('lodash');

const logger = require('./src/logger');
const github = require('./src/github/index');
const gephy = require('./src/gephy');

github
    .run([
        'fhnw-students',
        'w3tecch'
    ], (data) => {
        logger.info('[Crawler] Finished');
        // gephy.createFile(data);
    });

// function writeJsonFile(data) {
//     return new Promise((resolve, reject) => {
//         fs.writeFile(`${NAME}.json`, JSON.stringify(data), (err) => {
//             if (err) return logger.error(err);
//             logger.info('[Data] > ' + NAME + '.json');
//             resolve(data);
//         });
//     });
// }

// const data = require('./src/github/data');
// data.save().then((a)=>{
//     console.log(a);
// }).catch(err => {
//     console.log(err);
// });
