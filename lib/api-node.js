var H = require('./helpers');

var extend = H.extend,
	isPlainObject = H.isPlainObject;

function APINode(apiNodeDecl) {
	this.setTree(apiNodeDecl.tree);

	this.path = apiNodeDecl.pathCascade.pop();
	this.parents = apiNodeDecl.pathCascade;

	this.name = this.getNameFromPath(this.path);
	this.nodeType = apiNodeDecl.nodeType;

	if (typeof apiNodeDecl.options === 'object') {
		this.options = apiNodeDecl.options;
		return this;
	}

	this.options = {};

	if (typeof apiNodeDecl.options === 'string') {
		this.options.url = apiNodeDecl.options;
	}

	if (typeof apiNodeDecl.options === 'function') {
		this.options.transport = apiNodeDecl.options;
	}
}

APINode.prototype.getNameFromPath = function (nodePath) {
	return nodePath.match(/(?!\.)[^.]*$/)[0];
};

APINode.prototype.getParents = function () {
	var parents = [],
		x;

	for (x = 0; x < this.parents.length; x++) {
		parents.push(this.getParent(this.parents[x]));
	}

	return parents;

};

APINode.prototype.getParent = function (parentPath) {
	if (!parentPath) parentPath = this.parents[this.parents.length -1];

	return this.getTree().getNode(parentPath);
};

APINode.prototype.setTree = function (apiTree) {
	var tree = apiTree;

	this.getTree = function () {
		return tree;
	};

	return this;
};

APINode.prototype.getOptionsChain = function () {
	var nodeChain = this.getParents(),
		optionsChain = [],
		x;

	nodeChain.push(this);

	for (x = 0; x < nodeChain.length; x++) {
		optionsChain.push(nodeChain[x].options);
	}

	return optionsChain;
};

APINode.prototype.setOption = function (param, value, deep) {
	deep = deep || false;

	if (typeof param !== 'string') {
		return;
	}

	if (typeof value === 'undefined') {
		delete this.options[param];
		return;
	}

	if (isPlainObject(value) && isPlainObject(this.options[param]) && deep) {
		extend(deep, this.options[param], value);
		return;
	}

	this.options[param] = value;
};

APINode.prototype.getOption = function (param) {
	if (typeof param === 'undefined') {
		// shoud return copy of object
		return this.options;
	}

	if (typeof param !== 'string') {
		return;
	}

	return this.options[param];
};

module.exports = APINode;