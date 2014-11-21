var request = require('request'),
	extend = require('extend'),
	Q = require('q'); // to wrap helpers/Deferred or utils/Deferred

module.exports = transport;

var settings = {
	method: 'GET',
	accepts: {
		'*': '*/'.concat('*'),
		xml: 'application/xml, text/xml',
		text: 'text/plain',
		html: 'text/html',
		json: 'application/json, text/javascript'
	}
};

function transport (options, result, deferred) {
	var requestDefer = Q.defer(),
		requestOptions = buildOptions(options);

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

		result = extend(result, {
			data: JSON.parse(response.body), // refactor
			request: response
		});

		requestDefer.resolve(result);
	});

	return requestDefer.promise;
}

function buildOptions(options) {
	var result = extend(true, {}, options, result),
		headers = result.headers || {},
		option;

	result.headers = headers;

	result['method'] = result.method || result.type || settings.method;
	result['qs'] = buildQueryString(result);
	// form -> body?
	result['form'] = buildForm(result);
	result['auth'] = buildAuth(result);

	headers['Accept'] = buildAcceptHeader(result);

	return result;
}

function buildAcceptHeader(options) {
	var dataType = options.dataType;

	if (!dataType) return settings.accepts['*'];

	return [
		dataType,
		dataType !== '*' ? ', ' + settings.accepts[dataType] + '; q=0.01' : ''
	].join('');

}

function buildQueryString(options) {
	if (options.qs) return options.qs;

	if (options.method !== 'GET') return;
	
	return options.data;
}

function buildForm(options) {
	if (options.form) return options.form;

	if (options.method === 'GET') return;
	// serialize options.data ?
	return options.data;
}

function buildAuth(options) {
	if (options.auth) return options.auth;

	if (options.username) {
		return {
			username: options.username,
			password: options.password
		};
	}
}