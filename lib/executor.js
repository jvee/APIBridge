var H = require('./helpers');

var extend = H.extend,
	isArray = H.isArray,
	extendFunctions = H.extendFunctions,
	Deferred = H.Deferred,
	returnPromise = H.returnPromise,
	isPending = H.isPending;

function Executor(options) {
	extend(true, this, this.defaults, options);

	this._scope._ctx = this._ctx;
}

Executor.prototype.defaults = {
	extendRules: {},
	stages: [],
	ctx: {},
	_ctx: {},
	_scope: {}
};

Executor.prototype.exec = function (optionsChain, data, options, callback) {
	var result = {},
		deferred = new Deferred(),
		promise = returnPromise(deferred),
		execution, wiredArgs;

	// тесты, на полное отсутствие аргументов

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

	options = this.smartExtend(optionsChain, options);

	options.ctx = options.ctx || this.ctx;

	// добавить options.success, options.error, options.complete 
	if (callback && typeof callback === 'function') {
		promise.then(callback.bind(options.ctx), callback.bind(options.ctx));
	}

	// Этот ад нужно прокоментировать
	wiredArgs = [
		options,
		result,
		deferred
	];

	execution = this.buildQueue(wiredArgs);

	execution
		.then(deferred.resolve.bind(null, result))
		.fail(deferred.reject);

	// execution.then(function () { console.log(result);return result; });

	// что произойдет, если будет reject в одном из тасков ? fail(?)
	// что произойдет, если будет return false в одном из тасков ?

	return promise;
};

Executor.prototype.createTask = function (task, ctx, wiredArgs, stage) {
	return function () {
		var deferred = wiredArgs[2];

		if (deferred) {
			deferred.notify({
				stage: stage,
				task: task.name,
				result: wiredArgs[1]
			});
		}

		// останавливаем выполнение очереди тасков
		if (deferred && !isPending(deferred)) {
			throw new Error('stopped');
		}

		return task.apply(ctx, wiredArgs);
	};
};

Executor.prototype.addStageToQueue = function (taskQueue, stage, wiredArgs) {
	var options = stage.charAt(0) === '_' ? this._scope : wiredArgs[0],
		ctx = options.ctx,
		task;

	if (!options[stage]) {
		return;
	}

	if (typeof options[stage] === 'function') {
		task = this.createTask(options[stage], ctx, wiredArgs, stage);
		taskQueue.push(task);
	}

	if (isArray(options[stage])) {
		for (var x = 0; x < options[stage].length; x++) {
			task = this.createTask(options[stage][x], ctx, wiredArgs, stage);
			taskQueue.push(task);
		}
	}
};

Executor.prototype.buildQueue = function (wiredArgs) {
	var taskQueue = [],
		stagesCount = this.stages.length,
		x;

	for (x = 0; x < stagesCount; x++) {
		this.addStageToQueue(taskQueue, this.stages[x], wiredArgs);
	}

	return this.queue.apply(null, taskQueue);
};

Executor.prototype.queue = function () {
	var deferred = new Deferred(),
		sequence = returnPromise(deferred),
		x;

	deferred.resolve();

	for (x = 0; x < arguments.length; x++) {
		sequence = sequence.then(arguments[x]);
	}

	return sequence;
};

Executor.prototype.smartExtend = function (optionsChain, newOptions) {
	var result, rule;

	// optionsChain можно кэшировать и экстендить отдельно с newOptions
	result = extend.apply(null, [].concat(true, {}, optionsChain, newOptions));

	for (rule in this.extendRules) {
		result[rule] = this.extendRules[rule].apply(null, optionsChain);
		if (result[rule] === undefined) {
			delete result[rule];
		}
	}

	return result;
};

module.exports = Executor;