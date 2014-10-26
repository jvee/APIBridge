function APINode(apiNodeDecl) {
	this.setTree(apiNodeDecl.tree);

	this.path = apiNodeDecl.pathCascade.pop();
	this.parents = apiNodeDecl.pathCascade;

	this.name = this.getNameFromPath(this.path);
	this.nodeType = apiNodeDecl.nodeType;
	
	this.options = apiNodeDecl.options;
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

module.exports = APINode;