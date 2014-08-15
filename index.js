var _ = require('lodash');
var callerId = require('caller-id');
var colors = require('colors');
var memwatch = require('memwatch');

var processName = process.title || process.argv[1];

function stringifyArgs (args) {
	return args.map(function (arg) {
		return _.isObject(arg)
			? JSON.stringify(arg, null, 4)
			: arg && arg.toString();
	}).join(' ');
}

function isErrorLevel (level) {
	return level === 'error' || level === 'alert';
}

function getMessage (level, args, callerInfo) {
	args = Array.prototype.slice.call(args);
	if (_.isObject(args[args.length - 1])) {
		var data = args.pop();
	}
	return {
		time: new Date(),
		origin: callerInfo,
		process: processName,
		level: level,
		message: stringifyArgs(args),
		data: isErrorLevel(level) && data && data.stack || data
	};
}

function stringifyCallerInfo (info) {
	return [
		info.functionName,
		':',
		callerInfo.lineNumber,
		'@',
		callerInfo.filePath
	].join('');
}

function buildMethod (level) {
	var method = isErrorLevel(level) ? console.error : console.log;
	var color = isErrorLevel(level) ? 'red' : 'yellow';
	
	return function () {
		var callerInfo;
		
		try {
			callerInfo = stringifyCallerInfo(callerId.getData());
		} catch (error) {
			callerInfo = null;
		}

		var args = Array.prototype.slice.call(arguments);
		var message = getMessage(level, args, callerInfo);
		var text = JSON.stringify(message, null, 4);
		method.call(console, text[color]);
	};
}

function exit () {
	// temporal failure, user is invited to restart
	// (according to http://stackoverflow.com/a/1535733)
	process.exit(75);
}

function exitWhenGotUncaughtException () {
	process.on('uncaughtException', exit);
}

function exitWhenExceededMemoryLimit (limit) {
	memwatch.on('stats', function (info) {
		if (info.current_base > limit) {
			methods.info('exceeded memory limit', info.current_base.toString(), '>', limit.toString());
			exit();
		}
	});
}

var methods = {
	alert: buildMethod('alert'),
	error: buildMethod('error'),
	info: buildMethod('info'),
	debug: buildMethod('debug'),
	exitWhenGotUncaughtException: exitWhenGotUncaughtException,
	exitWhenExceededMemoryLimit: exitWhenExceededMemoryLimit,
	exit: exit
};

module.exports = methods;

process.on('uncaughtException', function (error) {
	methods.alert('uncaught exception', error);
});

methods.info('started');
