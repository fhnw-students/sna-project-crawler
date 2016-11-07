const winston = require('winston');

//__dirname
const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			level: 'debug',
			handleExceptions: true,
			json: false,
			colorize: true
		})
	],
	exitOnError: false
});

module.exports = logger;
