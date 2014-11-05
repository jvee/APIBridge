var $ = require('node-jquery'),
	Q = require('q'),
	extend = require('extend');

var Deferred = Q.defer;

// тесты
var transport = function (options, response) {
	var deferred = new Deferred();

	// isFunction || isArray
	if (options.transport) return;

	var request = $.ajax(options);

	request.then(function () {
		// jQuery hack
		// делать request для node.js с приблизительно
		// таким же набором параметров для универсальности
		
		extend(response, {
			data: arguments[0],
			request: arguments[2]
		});

		return deferred.resolve(response);
	});

	request.fail(function () {
		deferred.reject(arguments[0]);
	});

	return deferred.promise;
};

function isArray(object) {
	return Object.prototype.toString.call(object) === '[object Array]';
}

function extendFunctions(type) {

	return function (optionsChainItem) {
		var result = [],
			x, z;

		for (x = arguments.length - 1; x >= 0; x--) {
			if (arguments[x][type] === null) {
				break;
			}

			if (!arguments[x][type]) {
				continue;
			}

			if (isArray(arguments[x][type])) {

				for (z = arguments[x][type].length - 1; z >= 0; z--) {
					if (arguments[x][type][z] === null) {
						return result.length > 0 ? result.reverse(): undefined;
					}
					if (typeof arguments[x][type][z] === 'function') {
						result.push(arguments[x][type][z]);
					}
				}

				continue;
			}

			if (typeof arguments[x][type] === 'function') {
				result.push(arguments[x][type]);
			}
		}

		return result.length > 0 ? result.reverse(): undefined;
	};
}

function returnPromise(deferred) {
	return typeof deferred.promise === 'function' ?
				deferred.promise() :
				deferred.promise;
}

function isRejected(deferred) {
	return deferred.promise.isRejected();
}

module.exports = {
	transport: transport,
	extend: extend,
	Deferred: Deferred,
	isArray: isArray,
	extendFunctions: extendFunctions,
	returnPromise: returnPromise,
	isRejected: isRejected
};