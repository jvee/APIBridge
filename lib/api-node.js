function APINode(apiNodeDecl, nodePath, apiShadowTree) {
	this.name = apiNodeDecl.name;
	this.nodeType = apiNodeDecl.nodeType;
	this.path = nodePath;
	this.options = this.copyOptions(apiNodeDecl);
	//this.parent = this.getParentPath(nodePath);
	this.parents = this.getParentsPath();

	this.setTree(apiShadowTree);
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
	var parents = [],
		path;

	if (this.nodeType === 'root') return parents;

	path = this.path;

	while (path) {
		path = path.replace(/\.[^.]+$/, '');
		parents.push(path);
	}

	parents.reverse();
	parents[0] = '.';

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
	// можно добавить проверку на отсутствующий аргумент
	// и отдавать только одного предка ноды
	return this.getTree()[parentPath];
};

APINode.prototype.setTree = function (apiShadowTree) {
	var tree = apiShadowTree;

	this.getTree = function () {
		return tree;
	};

	return this;
};

module.exports = APINode;