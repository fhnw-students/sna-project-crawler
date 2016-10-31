const request = require('request');
const gexf = require('gexf');
const myGexf = gexf.create();

getRepos((repos) => {
	console.log(repos.length);
});



// TODO export to a .gexf file
// SEE: https://nodejs.org/api/fs.html
// As a document
var gephiAsJson = myGexf.document;

// As a string
var gephiAsXml = myGexf.serialize();

// console.log(gephiAsXml);


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
