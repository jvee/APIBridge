var APITree = require('./api-tree'),
	Executor = require('./executor'),
	H = require('./helpers');

function apiBridge(apiDecl, options) {
	var apiTree = new APITree(apiDecl),
		executor = new Executor({ _scope: { ctx: apiTree } }),
		api;

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