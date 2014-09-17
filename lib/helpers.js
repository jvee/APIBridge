var $ = require('node-jquery');

var Deferred = $.Deferred,
	when = $.when;

var queue = function () {
	var sequence = when(),
		x;

	for (x = 0; x < arguments.length; x++) {
		sequence = sequence.then(arguments[x]);
	}

	return sequence;
};

module.exports = {
	$: $,
	extend: $.extend,
	Deferred: Deferred,
	map: $.map,
	when: when,
	queue: queue
};