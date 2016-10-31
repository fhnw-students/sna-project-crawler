const request = require('request');
const gexf = require('gexf');
const fs = require('fs');


var myGexf = gexf.create();




function createGexfFile(){
	var filename = 'github.gexf';
	// As a document
	var gephiAsJson = myGexf.document;

	// As a string
	var gephiAsXml = myGexf.serialize();

	fs.exists(filename, (exists) => {
	 	if (exists){
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