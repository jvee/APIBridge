var H = require('./helpers');

function Executor(api, model, options) {
	this.defaults.extend(this, this.defaults, options);

	this.api = api;
	this.model = model;
}

Executor.prototype.defaults = {
	extendRules: {},
	extend: H.extend,
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
		argument: 'response'
	}, {
		name: 'processResult',
		argument: 'response'
	}],
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

	options.data = this.extend(options.data, data);

	optionsChain.push(options);
	options = this.smartExtend(optionsChain);

	options.ctx = options.ctx || this.api;
	options.transport = options.transport || this.transport;
	options.processTransport = this.processTransport.bind(this);

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

Executor.prototype.processTransport = function (response, requestObject) {
	return this.extend(response, requestObject);
	// delete options.processTransport
};

Executor.prototype.addStageToQueue = function (taskQueue, stage, wiredArgs) {
	var options = wiredArgs.options,
		arg = wiredArgs[stage.argument];

	if (options[stage.name] && typeof options[stage.name] === 'function') {
		taskQueue.push(options[stage.name].bind(options.ctx, arg));
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
	var result = {};

	optionsChain.unshift(result);
	optionsChain.unshift(true);

	return H.extend.apply(H, optionsChain);
};

module.exports = Executor;