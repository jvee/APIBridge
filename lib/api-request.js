var request = require('request'); /* var request = $.ajax */

/**
 * Небольшое описание схемы работы запроса
 *
 * prefilter -> transport -> processResponse -> callback
 *
 * 1. prefilter - необходим для обработки входных параметров для запроса
 * 2. transport - для изменения механизма обращения к удаленному API
 * 3. processResponse - для обработки ответа и преобразовывания его в определенную структуру
 * 
 */

/**
 * Defaults for APIRequest
 * @type {Object}
 */
var defaults = {
	url: undefined,
	processResponse: undefined,
	prefilter: undefined,
	transport: undefined,
	dataType: 'json',
	params: {},
	success: undefined,
	error: undefined,
	complete: undefined
};

/**
 * [exports description]
 * @param  {Object} options
 */
var APIRequest = module.exports =  function (options) {

	this.options = options;

};

/**
 * [send description]
 */
APIRequest.prototype.send = function () {

	// for future, not tested
	// transport should be similar to $.ajaxTransport
	// pass deffered as param to check status
	// is abort method needed ?
	if (this.options.transport) {
		return options.transport.call(this.options.ctx || global, options, deferred);
	}

	request(this.options, function (err, response) {
		// if (err) defferd.reject(err);

		// console.log(err, response.body);
		console.log(JSON.parse(response.body));
    });

};

/**
 * [setup description]
 * @return {[type]} [description]
 */
APIRequest.setup = function () {
	// тут нужно апдейтить defaults
	// экспортируется вместе с namespace
};