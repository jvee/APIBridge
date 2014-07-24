var $ = require('node-jquery');

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

$.ajaxSetup({
	accepts: {
		apiBridge: '*/'.concat( '*' ),
	},
	contents: {
		apiBridge: /./
	},
	converters: {
		apiBridge: function (data) {

			// here searching current request type parser

			return JSON.parse;
		}
	}
});

$.ajaxPrefilter('apiBridge', function (settings) {
	var APIObject;


	return APIObject.dataType;
});

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

	$.ajax({
		url: this.options.url,
		dataType: 'json',
		complete: function (jqXHR, status) {
			console.log('\n\n\n', status, '\n\n\n');
			console.log(JSON.parse(jqXHR.responseText));
		}
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