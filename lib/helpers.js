var Q = require('q'),
	extend = require('extend');

function isArray(object) {
	return Object.prototype.toString.call(object) === '[object Array]';
}

function isPlainObject(object) {
	return Object.prototype.toString.call(object) === '[object Object]';
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

function isPending(deferred) {
	return deferred.promise.isPending();
}

module.exports = {
	extend: extend,
	Deferred: Q.defer,
	isArray: isArray,
	isPlainObject: isPlainObject,
	extendFunctions: extendFunctions,
	returnPromise: returnPromise,
	isPending: isPending
};