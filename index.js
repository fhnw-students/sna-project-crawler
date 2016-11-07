const request = require('request');
const fs = require('fs');

const gexf = require('gexf');
const logger = require('./logger');
const myGexf = gexf.create({
	defaultEdgeType: "directed",
	model: {
		node: [
			{
				id: "name",
				type: "string",
				title: "Author's name"
			},
			{
				id: "surname",
				type: "string",
				title: "Author's surname"
			}
		],
		edge: [
			{
				id: "predicate",
				type: "string",
				title: "predicate"
			}
		]
	}
});

logger.info('Starting crawling');

// getRepos((repos) => {
// 	logger.info("repos", repos.length);
// });

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

	myGexf.addNode({
		id: 'n01',
		label: 'myFirstNode',
		attributes: {
			name: 'John',
			surname: 'Silver'
		},
		viz: {
			color: 'rgb(255, 234, 45)'
		}
	});

	myGexf.addNode({
		id: 'n02',
		label: 'myFirstNode',
		attributes: {
			name: 'John',
			surname: 'Doe'
		},
		viz: {
			color: 'rgb(45, 234, 45)'
		}
	});

	myGexf.addEdge({
		id: 'e01',
		source: 'n02',
		target: 'n01',
		attributes: {
			predicate: 'LIKES'
		},
		viz: {
			thickness: 34
		}
	});

	// As a document
	var gephiAsJson = myGexf.document;

	// As a string
	var gephiAsXml = myGexf.serialize();
	fs.exists(filename, (exists) => {
		if (exists) {
			fs.unlink(filename, (err) => {
				if (err) throw err;
				logger.info('successfully deleted');
			});
		}
		fs.writeFile(filename, gephiAsXml, (err) => {
			if (err) throw err;
			logger.info('It\'s saved!');
		});
	});
}
