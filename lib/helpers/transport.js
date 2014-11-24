var request = require('control-najax'),
	extend = require('extend'),
	Q = require('q'); // to wrap helpers/Deferred or utils/Deferred

module.exports = transport;

// Что не нравится в control-najax
// - неоднозначный парсинг статусов ответа
// - парсит данные исходя из опций, а не ответа
// - нет полей response* в xhr
// - коллбэки через одно место, нет возможности вызывать compleete
// - непонятно зачем используется jquery-deferred, если не используется resolveWith и пр.
// - кажется немного нелогично используются опции dataType и contentType
// - левые статус коды

function transport (options, result, deferred) {
	var requestDefer = Q.defer();

	if (options.transport) {
		return;
	}
	
	function requestErrorCallback(xhr, statusText, body) {
		return requestCallback(body, statusText, xhr);
	}

	function requestCallback(body, statusText, xhr) {
		// Добавить в result:
		// - response*
		// - getResponseHeader (или просто headers)
		// - statusText (учитывать "200: OK", или нет?)
		// - мб расширить общий deffered этими данными ?

		if (!xhr) {
			requestDefer.reject({error: body || statusText});
		}

		result = extend(result, {
			data: xhr && parseData(body, xhr),
			status: xhr && xhr.statusCode,
			headers: xhr && xhr.headers,
			statusText: statusText,
			request: xhr
		});

		if (!isSuccess(result.status) /* && options.passError */) {
			result.error = result.statusText;
			return requestDefer.reject(result);
		}

		requestDefer.resolve(result);
	}

	options.success = requestCallback;
	options.error = requestErrorCallback;

	request(options);

	return requestDefer.promise;
}

function isSuccess(status) {
	return status >= 200 && status < 300 || status === 304;
}

function parseData(data, xhr) {
	if (xhr.headers['content-type'].indexOf('json') > 0) {
		try {
			return JSON.parse(data);
		} catch (e) {
			return data;
		}
	}

	return data;
}