function APINode(APINodeDecl, nodePath, APIShadowTree) {
	this.name = APINodeDecl.name;
	this.nodeType = APINodeDecl.nodeType;
	this.path = nodePath;
	this.options = this.copyOptions(APINodeDecl);
	//this.parent = this.getParentPath(nodePath);
	this.parents = this.getParentsPath();

	this.setTree(APIShadowTree);
}

APINode.prototype.defaults = {
	optionsToExclude: ['name', 'nodeType']
};

APINode.prototype.copyOptions = function (APINodeDecl) {
	var result = {},
		option;

	// возможно лучшее решение было бы через $.extend()
	for (option in APINodeDecl) {
		if (this.isExludableOption(option)) continue;
		result[option] = APINodeDecl[option];
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

APINode.prototype.getParents = function () {};

APINode.prototype.getParent = function (parentPath) {
	// можно добавить проверку на отсутствующий аргумент
	// и отдавать только одного предка ноды
	return this.getTree()[parentPath];
};

APINode.prototype.setTree = function (APIShadowTree) {
	var tree = APIShadowTree;

	this.getTree = function () {
		return tree;
	};

	return this;
};

module.exports = APINode;