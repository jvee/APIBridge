var APINode = require('./api-node');

function APIShadowTree(normalizedAPIDecl) {
	var nodePath;

	for (nodePath in normalizedAPIDecl) {
		this[nodePath] = new APINode(normalizedAPIDecl[nodePath], nodePath, this);
	}

	return this;
}

module.exports = APIShadowTree;