var APINode = require('./api-node');

function APITree(normalizedAPIDecl) {
	var nodePath;

	this.nodes = {};

	for (nodePath in normalizedAPIDecl) {
		this.nodes[nodePath] = new APINode(normalizedAPIDecl[nodePath], nodePath, this);
	}

	return this;
}

APITree.prototype.getNode = function (nodePath) {
	return this.nodes[nodePath];
};

APITree.prototype.getNodes = function () {
	return this.nodes;
};

APITree.prototype.splitPath = function (nodePath) {
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

APITree.prototype.export = function () {
	var apiObject = this.exportChild(this.getNode('.'), 1);

	return apiObject;

};

APITree.prototype.exportChild = function (parent, level) {
	var result = {},
		path, node;

	for (path in this.getNodes()) {
		node = this.getNode(path);

		if (!this.isChildOf(parent, node)) continue;

		if (node.nodeType === 'endpoints') {
			// тут должен быть bind на apiObject
			result[node.name] = this.exportEndpoint(node);
			continue;
		}

		result[node.name] = this.exportChild(node, level + 1);
	}

	return result;
};

APITree.prototype.isChildOf = function (parent, target) {
	if (target.parents.length < 1) return false;

	return target.parents.indexOf(parent.path) === target.parents.length - 1;

};

APITree.prototype.exportEndpoint = function (node) {

	return function () {};

};

module.exports = APITree;