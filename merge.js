const _ = require('lodash');
const fs = require('fs');

const logger = require('./src/logger');

const SOURCE = './data';
const TARGET = './dist';
const now = new Date();

const buildFilename = () => {
	return `${TARGET}/${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.json`;
};

const main = (done) => {
	let data = {};
	fs.readdir(SOURCE, (err, filenames) => {
		filenames.forEach((filename, index) => {
			fs.readFile(`${SOURCE}/${filename}`, 'utf-8', (err, content) => {
				let json = JSON.parse(content);
				json.forEach((node) => {
					data[node.login] = node;
				});
				if (index === filenames.length - 1) {
					done(_.values(data));
				}
			});
		});
	});
};

logger.info('[MERGE] Starting');
main((data) => {
	let filename = buildFilename();
	fs.writeFile(filename, JSON.stringify(data), (err) => {
		if (err) return logger.error(err);
		logger.info('[MERGE] Finished ' + data.length);
	});
});
