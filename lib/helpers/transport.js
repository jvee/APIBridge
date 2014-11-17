var request = require('request'),
	extend = require('extend'),
	Q = require('q'); // to wrap helpers/Deferred or utils/Deferred

module.exports = transport;

var transportOptionsMapping = {
	url: 'url',

	method: function (options) {
		if (options.method) {
			return options.method.toUpperCase();
		}

		if (options.type) {
			return options.type.toUpperCase();
		}
	},

	headers: 'headers',

	qs: 'data' // refactor
};


function transport (options, result, deferred) {
	var requestDefer = Q.defer(),
		requestOptions = parseTransportOptions(options);

	// isFunction || isArray
	if (options.transport) {
		return;
	}
	
	// console.log(JSON.stringify(requestOptions, null, '  '));

	request(requestOptions, function (error, response, body) {

		if (error) {
			requestDefer.reject(error);
		}

		// парсим статус код (685)
		// смотрим заголовок и парсим JSON

		// response mappings
		response.status = response.statusCode;

		extend(result, {
			data: JSON.parse(response.body), // refactor
			request: response
		});

		requestDefer.resolve(response);
	});

	return requestDefer.promise;
}

function parseTransportOptions(options) {
	var result = {},
		option;

	for (option in transportOptionsMapping) {
		if (typeof transportOptionsMapping[option] === 'function') {
			result[option] = transportOptionsMapping[option](options);
		}

		if (typeof transportOptionsMapping[option] === 'string') {
			result[option] = options[transportOptionsMapping[option]];
		}
	}

	return result;
}