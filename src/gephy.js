const fs = require('fs');
const gexf = require('gexf');
const logger = require('./logger');
/////////////////////////////
const myGexf = gexf.create({
	defaultEdgeType: "directed",
	model: {
		node: [
			{
				id: "fullname",
				type: "string",
				title: "users's fullname"
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
/////////////////////////////

exports.createFile = (users) => {
	logger.info('[Gephy] Starting');
	// createGexfFile();
};

function createGexfFile() {
	var filename = 'github.gexf';
	var addedLangs = [];

	users.forEach((user) => {
		myGexf.addNode({
			id: user.login,
			label: user.login,
			attributes: {
				fullname: user.name
			},
			viz: {
				color: 'rgb(255, 234, 45)'
			}
		});
		user.langs.forEach((lang) => {
			if (addedLangs.indexOf(lang) < 0) {
				addedLangs.push(lang);
				myGexf.addNode({
					id: lang,
					label: lang,
					attributes: {
						fullname: lang
					},
					viz: {
						color: 'rgb(45, 234, 45)'
					}
				});
			}
			myGexf.addEdge({
				id: user.login + lang,
				source: user.login,
				target: lang,
				attributes: {
					predicate: 'LIKES'
				},
				viz: {
					thickness: 34
				}
			});
		});
	});

	// myGexf.addNode({
	// 	id: 'n01',
	// 	label: 'myFirstNode',
	// 	attributes: {
	// 		name: 'John',
	// 		surname: 'Silver'
	// 	},
	// 	viz: {
	// 		color: 'rgb(255, 234, 45)'
	// 	}
	// });

	// myGexf.addNode({
	// 	id: 'n02',
	// 	label: 'myFirstNode',
	// 	attributes: {
	// 		name: 'John',
	// 		surname: 'Doe'
	// 	},
	// 	viz: {
	// 		color: 'rgb(45, 234, 45)'
	// 	}
	// });

	// myGexf.addEdge({
	// 	id: 'e01',
	// 	source: 'n02',
	// 	target: 'n01',
	// 	attributes: {
	// 		predicate: 'LIKES'
	// 	},
	// 	viz: {
	// 		thickness: 34
	// 	}
	// });

	// myGexf.addEdge({
	// 	id: 'e01',
	// 	source: 'n01',
	// 	target: 'n02',
	// 	attributes: {
	// 		predicate: 'LIKES'
	// 	},
	// 	viz: {
	// 		thickness: 100
	// 	}
	// });

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
