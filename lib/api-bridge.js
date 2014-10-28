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
	}
};

function apiBridge(apiDecl, options) {
	var apiTree = new APITree(apiDecl),
		executor, executorOptions, api;

	executorOptions = H.extend(true, {}, defaults, options, {
		_scope: {
			ctx: apiTree}
		});

	executor = new Executor(executorOptions);

	//принимать через options
	function exportEndpoint(node) {
		var optionsChain = node.getOptionsChain();

		node.exec = executor.exec.bind(executor, optionsChain);

		return node.exec;
	}

	apiTree.exportEndpoint = exportEndpoint;
	api = apiTree.export();
	executor.ctx = api;

	return api;
}


module.exports = apiBridge;