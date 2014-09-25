var $ = require('node-jquery'),
	Q = require('q'),
	extend = require('extend');

var Deferred = Q.defer,
	when = Q.when;

var queue = function () {
	var sequence = when(),
		x;

	for (x = 0; x < arguments.length; x++) {
		sequence = sequence.then(arguments[x]);
	}

	return sequence;
};

// тесты
var request = function (options) {
	var deferred = new Deferred();

	var request = $.ajax(options);

	request.then(function () {
		// jQuery hack
		// делать request для node.js с приблизительно
		// таким же набором параметров для универсальности
		return deferred.resolve({
			data: arguments[0],
			request: arguments[2]
		});
	});

	request.fail(function () {
		deferred.reject(arguments[0]);
	});

	return deferred.promise;
};

module.exports = {
	$: $,
	request: request,
	extend: $.extend,
	Deferred: Deferred,
	map: $.map,
	when: when,
	queue: queue
};