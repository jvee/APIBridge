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
		str;

	if (this.nodeType === 'root') return parents;

	// Нужно документировать этот адский код
	function pushParent(sub, pos, full) {
		parents.push(full.replace(sub, '').split('').reverse().join(''));
		return '';
	}

	str = this.path.split('').reverse().join('');

	while (str) {
		str = str.replace(/[^.]+\./, pushParent);
	}

	parents.reverse();
	parents[0] = '.';

	return parents;
};

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