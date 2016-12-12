const fs = require('fs');
const gephy = require('./src/gephy');

fs.readFile('./data/2016-11-11.json', 'utf8', (err, data) => {
	if (err) throw err; // we'll not consider error handling for now
	var obj = JSON.parse(data);
	gephy.createFile(obj);
});