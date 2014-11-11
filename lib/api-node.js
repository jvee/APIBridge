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

APINode.prototype.setOptions = function (param, value, deep) {
	var extendTarget;

	deep = deep || false;

	if (typeof param === 'object' && arguments.length === 1) {
		this.options = param;
		return;
	}

	if (typeof param === 'string') {
		if (typeof value === 'undefined') {
			delete this.options[param];
			return;
		}

		if (!isPlainObject(value) || !isPlainObject(this.options[param])) {
			this.options[param] = value;
			return;
		}

		extendTarget = this.options[param];
	}

	if (typeof value === 'boolean' && !extendTarget) {
		deep = value;
		extendTarget = this.options;
		value = param;
	}
	
	if (extendTarget) {
		console.log(deep, extendTarget, value);

		extend(deep, extendTarget, value);
	}

};

module.exports = APINode;