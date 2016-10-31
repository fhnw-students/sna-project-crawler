const request = require('request');
const gexf = require('gexf');
const fs = require('fs');


var myGexf = gexf.create();






// TODO export to a .gexf file
// SEE: https://nodejs.org/api/fs.html
// As a document
var gephiAsJson = myGexf.document;

// As a string
var gephiAsXml = myGexf.serialize();

fs.exists('github.gexf', (exists) => {
  if (exists){
  	fs.unlink('github.gexf', (err) => {
	  if (err) throw err;
	  console.log('successfully deleted github.gexf');
	});
  }
  fs.writeFile('github.gexf', gephiAsXml, (err) => {
	if (err) throw err;
	console.log('It\'s saved!');
  });
});

