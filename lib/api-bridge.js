var APITree = require('./api-tree'),
	Executor = require('./executor'),
	H = require('./helpers'),
	transport = require('./helpers/transport');

var defaults = {
	extendRules: {
		prefilter: H.extendFunctions('prefilter'),
		processResult: H.extendFunctions('processResult')
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

	apiTree.exportEndpoint = exportEndpoint.bind(null, executor);
	api = apiTree.export();
	executor.ctx = api;

	api._set = apiTree.setOption.bind(apiTree);
	api._get = apiTree.getOption.bind(apiTree);

	return api;
}


module.exports = apiBridge;