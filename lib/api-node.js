function APINode(apiNodeDecl, nodePath, apiTree) {
	this.setTree(apiTree);

	this.name = apiNodeDecl.name;
	this.nodeType = apiNodeDecl.nodeType;
	this.path = nodePath;
	this.options = this.copyOptions(apiNodeDecl);
	//this.parent = this.getParentPath(nodePath);
	this.parents = this.getParentsPath();
}

APINode.prototype.defaults = {
	optionsToExclude: ['name', 'nodeType']
};

APINode.prototype.copyOptions = function (apiNodeDecl) {
	var result = {},
		option;

	// возможно лучшее решение было бы через $.extend()
	for (option in apiNodeDecl) {
		if (this.isExludableOption(option)) continue;
		result[option] = apiNodeDecl[option];
	}

	return result;
};

APINode.prototype.isExludableOption = function (option) {
	return this.defaults.optionsToExclude.indexOf(option) > -1;
};

APINode.prototype.getParentsPath = function () {
	var parents;

	if (this.nodeType === 'root') return [];

	parents = this.getTree().splitPath(this.path);
	parents.pop();

	return parents;
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

module.exports = APINode;