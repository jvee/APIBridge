var Q = require('q');
var $extend = require('extend');

var Deferred = Q.defer;
var extend = $extend; // должно быть $.extend, для браузера

var helpers = {
	extend: extend,
	Deferred: Deferred,
	isArray: isArray,
	isPlainObject: isPlainObject,
	returnPromise: returnPromise,
	isPending: isPending
};

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

module.exports = helpers;
