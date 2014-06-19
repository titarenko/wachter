var _ = require('lodash');
var callerId = require('caller-id');
var colors = require('colors');

var bus = {
	trigger: function () {
	}
};

var config = {
	pathPrefix: ''
};

var processName = require('path').dirname(require.main.filename).slice(config.pathPrefix.length || 0);
var processId = process.pid;

function appendNextPart (line, part) {
	if (line != '' && part != '.' && part != '...') {
		line += ' ' + part;
	} else {
		line += part;
	}
	return line;
}

function finalize (line) {
	if (line[line.length - 1] != '.') {
		line += '.';
	}
	return line;
}

function stringifyArgs (args) {
	var line = '';
	
	for (var i in args) {
		var part = args[i];
		if (_.isString(part)) {
			line = appendNextPart(line, part);
		} else {
			line = appendNextPart(line, _.isObject(part)
				? JSON.stringify(part, null, 4)
				: part && part.toString()
			);			
		}
	}

	if (line != '') {
		line = finalize(line);
	}

	return line;
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
		file: callerInfo.filePath.slice(config.pathPrefix.length || 0),
		line: callerInfo.lineNumber,
		'function': callerInfo.functionName,
		pid: processId,
		process: processName,
		level: level,
		message: stringifyArgs(args),
		data: isErrorLevel(level)
			? data && data.stack || data
			: data
	};
}

function triggerMessage (level, args, callerInfo) {
	var message = getMessage(level, args, callerInfo);
	
	bus.trigger('log:' + level, message);
	
	var method = isErrorLevel(level) ? console.error : console.log;
	var text = JSON.stringify(message, null, 4);
	var color = isErrorLevel(level) ? 'red' : 'yellow';
	
	method.call(console, text[color]);
	
	return message;
}

function getNullCallerInfo () {
	return {
		filePath: 'unknown',
		lineNumber: 0,
		functionName: 'unknown'
	};
}

var methods = {

	alert: function () {
		var callerInfo;
		
		try {
			callerInfo = callerId.getData();
		} catch (error) {
			callerInfo = getNullCallerInfo();
		}

		var message = triggerMessage('alert', arguments, callerInfo);
		
		bus.trigger('system:alert', message);
	},

	error: function () {
		var callerInfo;
		
		try {
			callerInfo = callerId.getData();
		} catch (error) {
			callerInfo = getNullCallerInfo();
		}
		
		triggerMessage('error', arguments, callerInfo);
	},

	info: function () {
		var callerInfo;
		
		try {
			callerInfo = callerId.getData();
		} catch (error) {
			callerInfo = getNullCallerInfo();
		}
		
		triggerMessage('info', arguments, callerInfo);
	},

	debug: function () {
		var callerInfo;
		
		try {
			callerInfo = callerId.getData();
		} catch (error) {
			callerInfo = getNullCallerInfo();
		}
		
		triggerMessage('debug', arguments, callerInfo);
	}

};

module.exports = methods;

process.on('uncaughtException', function (error) {
	methods.alert('Uncaught exception', error);
});

methods.info('Started');
