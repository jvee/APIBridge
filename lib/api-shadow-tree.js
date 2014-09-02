function APINode(APINodeDecl, nodePath) {
	this.name = APINodeDecl.name;
	this.nodeType = APINodeDecl.nodeType;
	this.path = nodePath;
	this.options = this.copyOptions(APINodeDecl);
	//this.parent = this.getParentPath(nodePath);
	//this.parents = this.getParents(nodePath);
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

APINode.prototype.getParentsPath = function () {};

APINode.prototype.getParentPath = function (nodePath) {};

APINode.prototype.getParents = function () {};

APINode.prototype.getParent = function () {};


function APIShadowTree(normalizedAPIDecl) {
	var nodePath;

	for (nodePath in normalizedAPIDecl) {
		this[nodePath] = new APINode(normalizedAPIDecl[nodePath], nodePath);
	}

	return this;
}

module.exports = APIShadowTree;