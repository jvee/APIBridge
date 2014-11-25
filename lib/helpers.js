var Q = require('q'),
	extend = require('extend');

function isArray(object) {
	return Object.prototype.toString.call(object) === '[object Array]';
}

function isPlainObject(object) {
	return Object.prototype.toString.call(object) === '[object Object]';
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
	returnPromise: returnPromise,
	isPending: isPending
};