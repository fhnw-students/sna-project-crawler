const _ = require('lodash');

const githubData = require('./data');
const logger = require('../logger');

let start = new Date();
let taskId = 1;
let queue = [];
let done;

const next = () => {
	let task = queue.shift();
	if (task && _.isFunction(task.run)) {
		logger.info(`[TASK-${task.id}] Starting`, task.message);
		task.run(() => {
			logger.info(`[TASK-${task.id}] Finished`, queue.length);
			next();
		});
	} else {
		let now = new Date();
		logger.info('[Github] Finished ' + (Math.abs(now - start) / 1000) / 60 + ' min');
		if (_.isFunction(done)) {
			done();
		}
	}
};

exports.test = () => queue.length;

exports.onFinished = (cb) => done = cb;

exports.add = (message, task) => {
	return queue.push({
		id: taskId++,
		message: message,
		run: task
	}) - 1;
};

exports.start = next;