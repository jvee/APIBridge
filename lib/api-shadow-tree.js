var APINode = require('./api-node');

function APIShadowTree(normalizedAPIDecl) {
	var nodePath;

	this.nodes = {};

	for (nodePath in normalizedAPIDecl) {
		this.nodes[nodePath] = new APINode(normalizedAPIDecl[nodePath], nodePath, this);
	}

	return this;
}

APIShadowTree.prototype.getNode = function (nodePath) {
	return this.nodes[nodePath];
};

APIShadowTree.prototype.splitPath = function (nodePath) {
	var pathArray = [nodePath];

	if (!nodePath || nodePath.charAt(0) !== '.') return [];

	if (nodePath === '.') return ['.'];

	while (nodePath) {
		nodePath = nodePath.replace(/\.[^.]+$/, '');
		pathArray.push(nodePath);
	}

	pathArray.reverse();
	pathArray[0] = '.';

	return pathArray;
};

APIShadowTree.prototype.getPathKeys = function () {
	var keys = Object.keys(this.nodes);

	return keys.sort();
};

module.exports = APIShadowTree;