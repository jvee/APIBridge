var H = require('./helpers');

var extend = H.extend,
	isArray = H.isArray,
	extendFunctions = H.extendFunctions,
	Deferred = H.Deferred;

function Executor(ctx, innerScopeCtx, options) {
	extend(true, this, this.defaults, options);

	this.ctx = ctx;
	this.innerScope.ctx = innerScopeCtx;
}

Executor.prototype.defaults = {
	extendRules: {
		prefilter: extendFunctions('prefilter'),
		processResult: extendFunctions('processResult')
	},
	stages: [{
		name: 'prefilter'
	}, {
		name: 'transport'
	}, {
		name: 'transport',
		isInnerScope: true
	}, {
		name: 'processResult'
	}],
	innerScope: {
		transport: H.transport
	}
};

Executor.prototype.exec = function (optionsChain, data, options, callback) {
	var taskQueue = [],
		response = {},
		execution, wiredArgs;

	// тесты, на полное отсутствие аргументов

	if (!optionsChain && !isArray(optionsChain)) {
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

	options.ctx = options.ctx || this.ctx;

	// Этот ад нужно прокоментировать
	wiredArgs = [
		options,
		response
	];

	taskQueue = this.buildQueue(taskQueue, wiredArgs);

	execution = this.queue.apply(null, taskQueue);

	// добавить options.success, options.error, options.complete 
	if (callback && typeof callback === 'function') {
		execution.then(callback.bind(options.ctx));
		execution.fail(callback.bind(options.ctx));
	}

	// execution.then(function () { console.log(response);return response; });

	// что произойдет, если будет reject в одном из тасков ? fail(?)
	// что произойдет, если будет return false в одном из тасков ?
	return execution;
};

Executor.prototype.createTask = function (task, ctx, wiredArgs) {
	return function () {
		return task.apply(ctx, wiredArgs);
	};
};

Executor.prototype.addStageToQueue = function (taskQueue, stage, wiredArgs) {
	var optionsScope = stage.isInnerScope ? this.innerScope : wiredArgs[0],
		ctx = optionsScope.ctx,
		task;

	if (!optionsScope[stage.name]) {
		return;
	}

	if (typeof optionsScope[stage.name] === 'function') {
		task = this.createTask(optionsScope[stage.name], ctx, wiredArgs);
		taskQueue.push(task);
	}

	if (isArray(optionsScope[stage.name])) {
		for (var x = 0; x < optionsScope[stage.name].length; x++) {
			task = this.createTask(optionsScope[stage.name][x], ctx, wiredArgs);
			taskQueue.push(task);
		}
	}
};

Executor.prototype.buildQueue = function (taskQueue, wiredArgs) {
	for (var x = 0; x < this.stages.length; x++) {
		this.addStageToQueue(taskQueue, this.stages[x], wiredArgs);
	}

	return taskQueue;
};

Executor.prototype.queue = function () {
	var deferred = new Deferred(),
		sequence = typeof deferred.promise === 'function' ?
					deferred.promise() :
					deferred.promise,
		x;

	deferred.resolve();

	for (x = 0; x < arguments.length; x++) {
		sequence = sequence.then(arguments[x]);
	}

	return sequence;
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