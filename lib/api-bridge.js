var APITree = require('./api-tree'),
	Executor = require('./executor'),
	H = require('./helpers');

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
	_scope: {
		_ctx: {},
		_transport: H.transport
	},
	exportEndpoint: function (executor, node) {
		var optionsChain = node.getOptionsChain();

		node.exec = executor.exec.bind(executor, optionsChain);

		return node.exec;
	}
};

function apiBridge(apiDecl, options) {
	var apiTree = new APITree(apiDecl),
		exportEndpoint, executor, api;

	options = H.extend(true, { _ctx: apiTree}, defaults, options);

	exportEndpoint = options.exportEndpoint;
	delete options.exportEndpoint;

	executor = new Executor(options);

	apiTree.exportEndpoint = exportEndpoint.bind(null, executor);
	api = apiTree.export();
	executor.ctx = api;

	return api;
}


module.exports = apiBridge;