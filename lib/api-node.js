function APINode(APINodeDecl, nodePath) {
	this.name = APINodeDecl.name;
	this.nodeType = APINodeDecl.nodeType;
	this.path = nodePath;
	this.options = this.copyOptions(APINodeDecl);
	//this.parent = this.getParentPath(nodePath);
	this.parents = this.getParentsPath();
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

module.exports = APINode;