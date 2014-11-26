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
		'prefilter',
		'transport',
		'_transport',
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

	// pluginIniter(executor, plOptions);

	apiTree.exportEndpoint = exportEndpoint.bind(null, executor);
	api = apiTree.export();
	executor.ctx = api;

	api._set = apiTree.setOption.bind(apiTree);
	api._get = apiTree.getOption.bind(apiTree);

	return api;
}

var plugins = [];

function plugin(pluginSetter) {
	// или же передавать просто именнованные функции
	plugins.push({name: pluginSetter.name, initer: pluginSetter.init});
}

function pluginIniter(executor, options) {
	var x;

	for (x = 0; x < plugins.length; x++) {
		// нужно подумать, как передавать опции, и нужны ли они вообще
		plugins[x].initer(executor, options[pluginName]);

		// var stages = {}, extendRules = {}
		// plugins[x].initer(stages, extendRules);
		// вручную раскидать stages и extendRules, но уже вне плагина
	}

}

apiBridge.plugin = plugin;

module.exports = apiBridge;