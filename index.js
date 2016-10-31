const request = require('request');
const fs = require('fs');

const gexf = require('gexf');
const myGexf = gexf.create();

getRepos((repos) => {
	console.log(repos.length);
});

createGexfFile();


///////////////////////////////

function getRequestOptions(path) {
	return {
		url: 'https://api.github.com' + path,
		headers: {
			'User-Agent': 'request'
		}
	}
}

function getRepos(done) {
	request(getRequestOptions('/repositories'), (error, response, body) => {
		if (!error && response.statusCode == 200) {
			done(JSON.parse(body));
		}
	});
}

function createGexfFile() {
	var filename = 'github.gexf';
	// As a document
	var gephiAsJson = myGexf.document;

	// As a string
	var gephiAsXml = myGexf.serialize();
	fs.exists(filename, (exists) => {
		if (exists) {
			fs.unlink(filename, (err) => {
				if (err) throw err;
				console.log('successfully deleted');
			});
		}
		fs.writeFile(filename, gephiAsXml, (err) => {
			if (err) throw err;
			console.log('It\'s saved!');
		});
	});
}
