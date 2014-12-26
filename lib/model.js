var APINode = require('./api-node');

function Model(apiDecl) {
	this.nodes = this.fetchNodes(apiDecl);
}

Model.prototype.fetchNodes = function (apiDecl) {
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
			model: this,
			pathCascade: pathCascade,
			nodeType: nodeType,
			options: apiDecl[nodeList[x]] || {}
		};

		nodes[nodeList[x]] = new APINode(nodeOptions);
	}

	return nodes;
};

Model.prototype.getNode = function (nodePath) {
	return this.nodes[nodePath];
};

Model.prototype.getNodes = function () {
	return this.nodes;
};

Model.prototype.splitPath = function (nodePath) {
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

Model.prototype.export = function () {
	return this.exportChild(this.getNode('.'));

};

Model.prototype.exportChild = function (parent) {
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

Model.prototype.isChildOf = function (parent, target) {
	if (target.parents.length < 1) return false;

	return target.parents.indexOf(parent.path) === target.parents.length - 1;

};

Model.prototype.exportEndpoint = function (node) {
	return function () {
		return node;
	};
};

Model.prototype.setOption = function (nodePath, param, value, deep) {
	if (typeof nodePath !== 'string') {
		return;
	}

	if (nodePath.charAt(0) !== '.') {
		deep = value;
		value = param;
		param = nodePath;
		nodePath = '.';
	}

	return this.getNode(nodePath).setOption(param, value, deep);
};

Model.prototype.getOption = function (nodePath, param) {
	if (typeof nodePath === 'undefined') {
		nodePath = '.';
	}

	if (nodePath.charAt(0) !== '.') {
		param = nodePath;
		nodePath = '.';
	}

	return this.getNode(nodePath).getOption(param);
};

module.exports = Model;