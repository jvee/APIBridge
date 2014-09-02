function APINode(APINodeDecl) {

}

function APIShadowTree(normalizedAPIDecl) {
	var node;

	for (node in normalizedAPIDecl) {
		this[node] = new APINode(normalizedAPIDecl[node]);
	}

	return this;
}

module.exports = APIShadowTree;