var APINode = require('./api-node'),
	Executor = require('./executor'),
	H = require('./helpers');

function APITree(apiDecl) {
	this.nodes = this.fetchNodes(apiDecl);

	this.executor = new Executor(null, this, {});
}

APITree.prototype.fetchNodes = function (apiDecl) {
	var nodes = {},
		pathCascade, nodeType, nodeOptions, nodeList, x, z;

	nodeList = Object.keys(apiDecl);

	for (x = 0; x < nodeList.length; x++) {
		pathCascade = this.splitPath(nodeList[x]);
		nodeType = 'handler';

		for (z = x + 1; z < nodeList.length; z++) {
			if (nodeList[z].indexOf(nodeList[x]) > -1) {
				nodeType = 'layer';
				break;
			}
		}

		for (z = 0; z < pathCascade.length - 1; z++) {
			if (nodeList.indexOf(pathCascade[z]) < 0) {
				nodeList.push(pathCascade[z]);
			}
		}

		nodeOptions = {
			tree: this,
			pathCascade: pathCascade,
			nodeType: nodeType,
			options: apiDecl[nodeList[x]] || {}
		};

		nodes[nodeList[x]] = new APINode(nodeOptions);
	}

	return nodes;
};

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
	var apiObject = this.exportChild(this.getNode('.'));

	this.executor.ctx = apiObject;

	return apiObject;

};

APITree.prototype.exportChild = function (parent) {
	var result = {},
		path, node;

	for (path in this.getNodes()) {
		node = this.getNode(path);

		if (!this.isChildOf(parent, node)) continue;

		if (node.nodeType === 'handler') {
			result[node.name] = this.exportEndpoint(node);
			continue;
		}

		result[node.name] = this.exportChild(node);
	}

	return result;
};

APITree.prototype.isChildOf = function (parent, target) {
	if (target.parents.length < 1) return false;

	return target.parents.indexOf(parent.path) === target.parents.length - 1;

};

APITree.prototype.exportEndpoint = function (node) {
	var optionsChain = node.getOptionsChain();

	node.exec = this.executor.exec.bind(this.executor, optionsChain);

	return node.exec;
};

module.exports = APITree;