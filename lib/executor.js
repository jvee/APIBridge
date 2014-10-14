var H = require('./helpers');

var extend = H.extend;

function Executor(api, model, options) {
	extend(true, this, this.defaults, options);

	this.api = api;
	this.model = this.innerScope.ctx = model;
}

function processTransport(response, requestObject) {
	return extend(response, requestObject);
}

Executor.prototype.defaults = {
	extendRules: {},
	transport: H.request,
	Deferred: H.Deferred,
	queue: H.queue,
	stages: [{
		name: 'prefilter',
		argument: 'options'
	}, {
		name: 'transport',
		argument: 'options'
	}, {
		name: 'processTransport',
		argument: 'response',
		isInnerScope: true
	}, {
		name: 'processResult',
		argument: 'response'
	}],
	innerScope: {
		processTransport: processTransport
	}
};

Executor.prototype.exec = function (optionsChain, data, options, callback) {
	var taskQueue = [],
		response = {},
		execution;

	// тесты, на полное отсутствие аргументов

	// вынести в хелперы
	if (!optionsChain && Object.prototype.toString.call(optionsChain) !== '[object Array]') {
		throw new Error('Options chain is missing'); // reject
	}

	if (typeof data === 'function') {
		callback = data;
		options = {};
		data = {};
	}

	if (!options) {
		options = {};
	}

	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	options.data = extend(options.data, data);

	optionsChain.push(options);
	options = this.smartExtend(optionsChain);

	options.ctx = options.ctx || this.api;
	options.transport = options.transport || this.transport;

	taskQueue = this.buildQueue(taskQueue, options, response);

	execution = this.queue.apply(null, taskQueue);

	// добавить options.success, options.error, options.complete 
	if (callback && typeof callback === 'function') {
		execution.then(callback.bind(options.ctx));
		execution.fail(callback.bind(options.ctx));
	}

	// что произойдет, если будет reject в одном из тасков ? fail(?)
	// что произойдет, если будет return false в одном из тасков ?
	return execution;
};

Executor.prototype.addStageToQueue = function (taskQueue, stage, wiredArgs) {
	var optionsScope = stage.isInnerScope ? this.innerScope : wiredArgs.options,
		arg = wiredArgs[stage.argument],
		ctx = optionsScope.ctx;

	if (!optionsScope[stage.name]) {
		return;
	}

	if (typeof optionsScope[stage.name] === 'function') {
		taskQueue.push(optionsScope[stage.name].bind(ctx, arg));
	}

	if (Object.prototype.toString.call(optionsScope[stage.name]) === '[object Array]') {
		for (var x = 0; x < optionsScope[stage.name].length; x++) {
			taskQueue.push(optionsScope[stage.name][x].bind(ctx, arg));
		}
	}
};

Executor.prototype.buildQueue = function (taskQueue, options, response) {
	var wiredArgs = {
			options: options,
			response: response
		};

	for (var x = 0; x < this.stages.length; x++) {
		this.addStageToQueue(taskQueue, this.stages[x], wiredArgs);
	}

	return taskQueue;
};

Executor.prototype.smartExtend = function (optionsChain) {
	var result = {},
		extendedByRule = {},
		rule;

	for (rule in this.extendRules) {
		extendedByRule[rule] = this.extendRules[rule].apply(null, optionsChain);
	}

	result = extend.apply(null, [].concat(true, result, optionsChain));

	return extend(result, extendedByRule);
};

module.exports = Executor;