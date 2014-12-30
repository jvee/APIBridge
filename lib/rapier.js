var APIModel = require('./model'),
	Executor = require('./executor'),
	H = require('./helpers'),
	transport = require('./plugins/transport'),
	urlTemplate = require('./plugins/url-template'),
	extendFunctions = require('./plugins/extendFunctions');

var defaults = {
	extendRules: {},
	stages: [
		'_prefilter',
		'prefilter',
		'_postfilter',
		'transport',
		'_transport',
		'_processResult',
		'processResult'
	],
	_scope: {
		_postfilter: urlTemplate
	},
	exportEndpoint: function (executor, node) {
		var optionsChain = node.getOptionsChain();

		node.exec = executor.exec.bind(executor, optionsChain);

		return node.exec;
	}
};

function apiBridge(apiDecl, options) {
	var apiModel = new APIModel(apiDecl),
		exportEndpoint, executor, api;

	options = H.extend({ _ctx: apiModel}, defaults, options);

	exportEndpoint = options.exportEndpoint;
	delete options.exportEndpoint;

	executor = new Executor(options);

	// mb pass some plagin options
	pluginIniter(executor);

	apiModel.exportEndpoint = exportEndpoint.bind(null, executor);
	api = apiModel.export();
	executor.ctx = api;

	api._set = apiModel.setOption.bind(apiModel);
	api._get = apiModel.getOption.bind(apiModel);

	return api;
}

/**
 * Массив, хранящий информацию о всех плагинах
 * @type {Array}
 */
var plugins = [
	transport,
	extendFunctions
];

/**
 * Регистрация плагина в фреймворке
 * @param  {Object|Function} pluginSetter Описание плагина
 */
function plugin(pluginSetter) {
	plugins.push(pluginSetter);
}

/**
 * Сброс все зарегестрированных плагинов
 * В основмно используется для тестирования
 */
function pluginReset() {
	plugins = [
		transport,
		extendFunctions
	];
}

/**
 * Инициацлизация всех зарегистрированных плагинов для инстанса апи
 * @param  {Executor} executor инстанс executor под одтельное апи
 * @param  {Object} options  опции, переданный с инициализацией апи
 */
function pluginIniter(executor, options) {
	var pluginList = [],
		x, stage, stages, extendRule, extendRules, plugin;

	// preparing plugins
	for (x = 0; x < plugins.length; x++) {
		if (typeof plugins[x] === 'function') {
			pluginList.push(plugins[x](/* executor, apiBridge, helpers */));
			continue;
		}

		pluginList.push(plugins[x]);
	}

	for (x = 0; x < pluginList.length; x++) {
		// проверять настройки
		// возможно какой-то плагин нужно пропустить
		// плюс искать настройки для плагина (не понятно, нужны ли они вообще)

		stages = pluginList[x].stages || {};
		extendRules = pluginList[x].extendRules || {};

		// setting up stages
		for (stage in stages) {
			// check array
			if (!executor._scope[stage]) {
				executor._scope[stage] = [];
			}

			executor._scope[stage].push(stages[stage]);

		}

		// setting up rules
		for (extendRule in extendRules) {
			executor.extendRules[extendRule] = extendRules[extendRule];
		}
	}

}

apiBridge.plugin = plugin;
apiBridge.pluginReset = pluginReset;

module.exports = apiBridge;