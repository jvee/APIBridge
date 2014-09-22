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
			response = {};

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

		/*
			попробовать при рефакторинге:

			stages = ['prefilter', 'transport', 'processResult']
			function addStage (stage, arg) {
				if (options[stage] && tpyeof options[stage] === 'function') {
					taskQueue.push(options[stage].bind(ctx, arg))
				} else if (stage === 'transport') {
					...
				}
						if (stage === transport) {
					...
				}
			}
			addStage('prefilter', options)
			addStage('transport', options)
			addStage('processResult', options)
		*/

		if (options.prefilter && typeof options.prefilter === 'function') {
			taskQueue.push(options.prefilter.bind(ctx, options));
		}

		if (options.transport && typeof options.transport === 'function') {
			taskQueue.push(options.transport.bind(ctx, options));
		} else {
			taskQueue.push(H.request.bind(null, options));
		}

		taskQueue.push(function (xhr) {
			response = H.extend(response, xhr);
			return response;
		});

		if (options.processResult && typeof options.processResult === 'function') {
			taskQueue.push(options.processResult.bind(ctx, response));
		}

		// if (callback && typeof callback === 'function') ...

		// что произойдет, если будет reject в одном из тасков ? fail(?)
		// что произойдет, если будет return false в одном из тасков ?
		return H.queue.apply(null, taskQueue);
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