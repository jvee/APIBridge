var APITree = require('./api-tree'),
	Executor = require('./executor'),
	H = require('./helpers'),
	transport = require('./helpers/transport'),
	extendFunctions = require('./helpers/extendFunctions');

var defaults = {
	extendRules: {
		prefilter: extendFunctions('prefilter'),
		processResult: extendFunctions('processResult')
	},
	stages: [
		'_prefilter',
		'prefilter',
		'_postfilter',
		'transport',
		'_transport',
		'_processResult',
		'processResult'
	],
	_transport: transport,
	_scope: {},
	exportEndpoint: function (executor, node) {
		var optionsChain = node.getOptionsChain();

		node.exec = executor.exec.bind(executor, optionsChain);

		return node.exec;
	}
};

function apiBridge(apiDecl, options) {
	var apiTree = new APITree(apiDecl),
		exportEndpoint, executor, api;

	options = H.extend({ _ctx: apiTree}, defaults, options);

	exportEndpoint = options.exportEndpoint;
	delete options.exportEndpoint;


	options._scope._transport = options._transport;
	delete options._transport;

	executor = new Executor(options);

	// mb pass some plagin options
	pluginIniter(executor);

	apiTree.exportEndpoint = exportEndpoint.bind(null, executor);
	api = apiTree.export();
	executor.ctx = api;

	api._set = apiTree.setOption.bind(apiTree);
	api._get = apiTree.getOption.bind(apiTree);

	return api;
}

// возможно лучщще хранить информацию в объекте?
var plugins = [];

function plugin(pluginSetter) {
	plugins.push(pluginSetter);
}

function pluginReset() {
	plugins = [];
}

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