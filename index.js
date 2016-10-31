const request = require('request');
const gexf = require('gexf');

var myGexf = gexf.create();






// TODO export to a .gexf file
// SEE: https://nodejs.org/api/fs.html
// As a document
var gephiAsJson = myGexf.document;

// As a string
var gephiAsXml = myGexf.serialize();

console.log(gephiAsXml);