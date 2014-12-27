var H = require('./helpers');

var extend = H.extend,
	isPlainObject = H.isPlainObject;

function Node(nodeDecl) {
	this.setModel(nodeDecl.model);

	this.path = nodeDecl.pathCascade.pop();
	this.parents = nodeDecl.pathCascade;

	this.name = this.getNameFromPath(this.path);
	this.nodeType = nodeDecl.nodeType;

	if (typeof nodeDecl.options === 'object') {
		this.options = nodeDecl.options;
		return this;
	}

	this.options = {};

	if (typeof nodeDecl.options === 'string') {
		this.options.url = nodeDecl.options;
	}

	if (typeof nodeDecl.options === 'function') {
		this.options.transport = nodeDecl.options;
	}
}

Node.prototype.getNameFromPath = function (nodePath) {
	return nodePath.match(/(?!\.)[^.]*$/)[0];
};

Node.prototype.getParents = function () {
	var parents = [],
		x;

	for (x = 0; x < this.parents.length; x++) {
		parents.push(this.getParent(this.parents[x]));
	}

	return parents;

};

Node.prototype.getParent = function (parentPath) {
	if (!parentPath) parentPath = this.parents[this.parents.length -1];

	return this.getModel().getNode(parentPath);
};

Node.prototype.setModel = function (apiModel) {
	var model = apiModel;

	this.getModel = function () {
		return model;
	};

	return this;
};

Node.prototype.getOptionsChain = function () {
	var nodeChain = this.getParents(),
		optionsChain = [],
		x;

	nodeChain.push(this);

	for (x = 0; x < nodeChain.length; x++) {
		optionsChain.push(nodeChain[x].options);
	}

	return optionsChain;
};

Node.prototype.setOption = function (param, value, deep) {
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

Node.prototype.getOption = function (param) {
	if (typeof param === 'undefined') {
		// shoud return copy of object
		return this.options;
	}

	if (typeof param !== 'string') {
		return;
	}

	return this.options[param];
};

module.exports = Node;