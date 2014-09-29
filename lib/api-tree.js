var APINode = require('./api-node'),
	H = require('./helpers');

function APITree(normalizedAPIDecl) {
	var nodePath;

	this.nodes = {};

	for (nodePath in normalizedAPIDecl) {
		this.nodes[nodePath] = new APINode(normalizedAPIDecl[nodePath], nodePath, this);
	}

	return this;
}

APITree.prototype.getNode = function (nodePath) {
	return this.nodes[nodePath];
};

APITree.prototype.getNodes = function () {
	return this.nodes;
};

APITree.prototype.splitPath = function (nodePath) {
	var pathArray = [nodePath];

	if (!nodePath || nodePath.charAt(0) !== '.') return [];

	if (nodePath === '.') return ['.'];

	while (nodePath) {
		nodePath = nodePath.replace(/\.[^.]+$/, '');
		pathArray.push(nodePath);
	}

	pathArray.reverse();
	pathArray[0] = '.';

	return pathArray;
};

APITree.prototype.export = function () {
	var apiObject = this.exportChild(this.getNode('.'), 1);

	return apiObject;

};

APITree.prototype.exportChild = function (parent, level) {
	var result = {},
		path, node;

	for (path in this.getNodes()) {
		node = this.getNode(path);

		if (!this.isChildOf(parent, node)) continue;

		if (node.nodeType === 'endpoints') {
			// тут должен быть bind на apiObject
			result[node.name] = this.exportEndpoint(node);
			continue;
		}

		result[node.name] = this.exportChild(node, level + 1);
	}

	return result;
};

APITree.prototype.isChildOf = function (parent, target) {
	if (target.parents.length < 1) return false;

	return target.parents.indexOf(parent.path) === target.parents.length - 1;

};

APITree.prototype.exportEndpoint = function (node) {
	var optionsChain = node.getOptionsChain(),
		ctx = node.getTree();

	return function (data, options, callback) {
		var queue,
			taskQueue = [],
			response = {},
			execution;

		// тесты, на полное отсутствие аргументов

		if (!options) {
			options = {};
		}

		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		// extend ?
		options.data = data;

		optionsChain.push(options);
		options = extender(optionsChain);

		var stages = ['prefilter', 'transport', 'processResult'];

		function addStageToQueue (stage, arg) {
			if (options[stage] && typeof options[stage] === 'function') {
				taskQueue.push(options[stage].bind(ctx, arg));
			}
		}

		addStageToQueue('prefilter', options);

		if (!options.transport) {
			options.transport = H.request;
		}

		addStageToQueue('transport', options);

		taskQueue.push(function (xhr) {
			response = H.extend(response, xhr);
			return response;
		});

		addStageToQueue('processResult', response);

		execution = H.queue.apply(null, taskQueue);

		if (callback && typeof callback === 'function') {
			execution.then(callback.bind(options.ctx || ctx));
			execution.fail(callback.bind(options.ctx || ctx));
		}

		// что произойдет, если будет reject в одном из тасков ? fail(?)
		// что произойдет, если будет return false в одном из тасков ?
		return execution;
	};

};

function extender(optionsChain) {
	var result = {};

	optionsChain.unshift(result);
	optionsChain.unshift(true);

	return H.extend.apply(H, optionsChain);
}


function executor(options, origOptions, defferd) {

}

module.exports = APITree;