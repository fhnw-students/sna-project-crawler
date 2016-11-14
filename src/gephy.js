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
	createGexfFile(users);
};

function createGexfFile(users) {
	var filename = 'github.gexf';
	var addedLangs = [];

	users.forEach((user) => {
		var fullname = user.fullname != null ? user.fullname : '';
		myGexf.addNode({
			id: user.login,
			label: user.login,
			attributes: {
				fullname: fullname
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
				id: user.login + '-' + lang,
				source: user.login,
				target: lang,
				attributes: {
					predicate: 'USES'
				},
				viz: {
					thickness: 34
				}
			});
		});
		user.followers.forEach((follower) => {
			myGexf.addEdge({
				id: follower + '-' + user.login,
				source: follower,
				target: user.login,
				attributes: {
					predicate: 'FOLLOWS'
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
				logger.info('[Gephy] successfully deleted');
			});
		}
		fs.writeFile(filename, gephiAsXml, (err) => {
			if (err) throw err;
			logger.info('[Gephy] It\'s saved!');
		});
	});

}
