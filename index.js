const request = require('request');
const fs = require('fs');

const gexf = require('gexf');
const logger = require('./logger');
logger.info('Starting crawling');

// getRepos((repos) => {
// 	logger.info("repos", repos.length);
// });

// createGexfFile();

// user = {
// login
// name
// langs
//}

class User {

    constructor(login, name) {
        this.login = login;
        this.name = name;
        this.langs = [];
    }

}

const users = [];
getUser('hirsch88')
    .then((user) => {
        let newUser = new User(user.login, user.name);
        users.push(newUser);
        getUsersRepos(user.login).then((repos) => {
            let queue = [];
            repos.forEach((repo) => {
                queue.push(getUserRepoLang(user.login, repo.name).then((langs) => {
                    for (var key in langs) {
                        if (langs.hasOwnProperty(key) && newUser.langs.indexOf(key) < 0) {
                            newUser.langs.push(key);
                        }
                    }
                }));
            });
            Promise.all(queue).then(() => {
                logger.info('done', users);
                createGexfFile();
            }).catch(logger.error);
        }).catch(logger.error);
    }).catch(logger.error);


// getUser(name, (user) => {
// 	let newUser = new User(user.login, user.name);
// 	users.push(newUser);
// getUsersRepos(user.login, (repos) => {
// 	repos.forEach((repo) => {
// 		getUserRepoLang(user.login, repo.name, (langs) => {
// 			logger.info(user.login, repo.name, langs);
// 			for (var key in langs) {
// 				if (langs.hasOwnProperty(key) && newUser.langs.indexOf(key) < 0) {
// 					newUser.langs.push(key);
// 				}
// 			}
// 		});
// 	});
// });
// });


///////////////////////////////
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
///////////////////////////////

function getUser(userLogin) {
    return new Promise((resovle, reject) => {
        request(getRequestOptions('/users/' + userLogin), (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resovle(JSON.parse(body));
            } else {
                reject({
                    error: error,
                    status: response.statusCode,
                });
            }
        });
    });
}

function getUsersRepos(userLogin) {
    return new Promise((resovle, reject) => {
        request(getRequestOptions('/users/' + userLogin + '/repos'), (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resovle(JSON.parse(body));
            } else {
                reject({
                    error: error,
                    status: response.statusCode,
                });
            }
        });
    });
}

///repos/hirsch88/angular-bootstrap-slider/languages
function getUserRepoLang(userLogin, repoName) {
    return new Promise((resovle, reject) => {
        request(getRequestOptions('/repos/' + userLogin + '/' + repoName + '/languages'), (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resovle(JSON.parse(body));
            } else {
                reject({
                    error: error,
                    status: response.statusCode,
                });
            }
        });
    });
}

// function getRepos(done) {
// 	return new Promise((resovle) => {
// 		request(getRequestOptions('/repositories'), (error, response, body) => {
// 			if (!error && response.statusCode == 200) {
// 				done(JSON.parse(body));
// 			}
// 		});
// 	});
// }

function getRequestOptions(path) {
    return {
        url: 'https://api.github.com' + path,
        headers: {
            'User-Agent': 'request'
        }
    }
}

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
			if (addedLangs.indexOf(lang) < 0){
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
				id: user.login+lang,
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
