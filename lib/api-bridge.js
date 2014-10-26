var APITree = require('./api-tree'),
	H = require('./helpers');

function apiBridge(apiDecl, options) {
	var apiTree = new APITree(apiDecl);

	return apiTree.export();
}


module.exports = apiBridge;