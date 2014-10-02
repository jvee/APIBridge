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

APITree.prototype.exportChild = function (parent, level, ctx) {
	var result = {},
		path, node;

	if (!ctx) {
		// сделать интеграционные тесты и проверить контекст
		// протестировать проброс ctx через options
		ctx = result;
	}

	for (path in this.getNodes()) {
		node = this.getNode(path);

		if (!this.isChildOf(parent, node)) continue;

		if (node.nodeType === 'endpoints') {
			result[node.name] = this.exportEndpoint(node, ctx);
			continue;
		}

		result[node.name] = this.exportChild(node, level + 1, ctx);
	}

	return result;
};

APITree.prototype.isChildOf = function (parent, target) {
	if (target.parents.length < 1) return false;

	return target.parents.indexOf(parent.path) === target.parents.length - 1;

};

APITree.prototype.exportEndpoint = function (node, ctx) {
	var optionsChain = node.getOptionsChain();

	return function (data, options, callback) {
		var taskQueue = [],
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

		// добавить options.success, options.error, options.complete 
		options.data = H.extend(options.data, data);
		options.ctx = options.ctx || ctx;
		options.transport = options.transport || H.request;

		optionsChain.push(options);
		options = extender(optionsChain);

		options.processRequest = function (response, xhr) {
			response = H.extend(response, xhr);
			return response;
		};

		function addStageToQueue (stage, arg) {
			if (options[stage] && typeof options[stage] === 'function') {
				taskQueue.push(options[stage].bind(options.ctx, arg));
			}
		}

		var stages = [
			{name: 'prefilter', arg: options},
			{name: 'transport', arg: options},
			{name: 'processRequest', arg: response},
			{name: 'processResult', arg: response}
		];

		for (var x = 0; x < stages.length; x++) {
			addStageToQueue(stages[x].name, stages[x].arg);
		}

		execution = H.queue.apply(null, taskQueue);

		if (callback && typeof callback === 'function') {
			execution.then(callback.bind(options.ctx));
			execution.fail(callback.bind(options.ctx));
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