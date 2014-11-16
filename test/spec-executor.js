var assert = require('assert'),
	Executor = require('../lib/executor'),
	H = require('../lib/helpers');

describe('Executor', function () {

	var executor;

	beforeEach(function () {
		executor = new Executor({
			stages: [
				'prefilter',
				'processResult'
			]
		});
		executor.ctx = {context: true};
	});

	describe('#createTask()', function () {
		var deferred, wiredArgs, context, task;

		beforeEach(function () {
			deferred = H.Deferred();
			wiredArgs = [[], {}, deferred];
			context = {};
		});

		it('should retunr function', function () {
			assert.equal(typeof executor.createTask(), 'function');
		});

		it('should return function, bound to passed contenxt and array of arguments', function () {
			task = executor.createTask(function (arg1, arg2) {
				assert.equal(this, context);
				assert.equal(arg1, wiredArgs[0]);
				assert.equal(arg2, wiredArgs[1]);
			}, context, wiredArgs);

			task();
		});

		it('should throw error with passed rejected deferred', function () {
			task = executor.createTask(function () {}, context, wiredArgs);

			deferred.reject();

			assert.throws(task);
		});

		it('should trigger deferred.notify', function (done) {
			task = executor.createTask(function testTask() {}, context, wiredArgs, 'testStage');

			H.returnPromise(deferred).progress(function (progress) {
				assert.equal(progress.stage, 'testStage');
				assert.equal(progress.task, 'testTask');
				assert.equal(progress.result, wiredArgs[1]);
				done();
			});

			task();
		});

	});

	describe('#addStageToQueue()', function () {
		var taskQueue = [],
			stage = 'someStage',
			stage2 = 'anotherStage',
			wiredArgs = [
				//options
				{
					someStage: testFunc,
					anotherStage: [ testFunc, testFunc ],
					ctx: {
						context: true
					}
				},
				// result
				{}
			];

		function testFunc(options, result) {
			assert.deepEqual(this, {context: true});
			assert.equal(options, wiredArgs[0]);
			assert.equal(result, wiredArgs[1]);
		}

		it('should add binded to options.ctx function with wired argument', function () {
			executor.addStageToQueue(taskQueue, stage, wiredArgs);

			assert.equal(taskQueue.length, 1);

			taskQueue[0]();

		});

		it('should accept array of functions passed as options.stageName', function () {
			executor.addStageToQueue(taskQueue, stage2, wiredArgs);

			assert.equal(taskQueue.length, 3);

			taskQueue[1]();
			taskQueue[2]();
		});

		it('Should accept array of functions passed as executorInstance#_scope.stageName', function () {
			var stage3 = '_stage';

			executor._scope.ctx = { context: true };

			executor._scope['_stage'] = [function (options, result) {
				assert.equal(options, wiredArgs[0]);
				assert.equal(result, wiredArgs[1]);
				assert.equal(this, executor._scope.ctx);
			}];

			executor.addStageToQueue(taskQueue, stage3, wiredArgs);

			assert.equal(taskQueue.length, 4);

			taskQueue[3]();
		});
	});

	describe('#buildQueue()', function () {
		var options, result, deferred, execution;

		beforeEach(function () {
			options = {
				prefilter: [function prefilterTest(options, result, deferred) {
					result.prefilterExecuted = true;
				}] ,
				processResult: [function processResultTest(options, result, deferred) {
					result.processResultExecuted = true;
					return result;
				}]
			};
			result = {};
			deferred = H.Deferred();
		});

		it('should pass right arguments to #addStageToQueue()', function () {
			executor.addStageToQueue = function (passedTaskQueue, passedStage, passedWiredArgs) {
				assert.equal(Object.prototype.toString.call(passedTaskQueue), '[object Array]');
				assert.ok(executor.stages.indexOf(passedStage) >= 0);
				assert.equal(passedWiredArgs[0], options);
				assert.equal(passedWiredArgs[1], result);
			};

			execution = executor.buildQueue([options, result, deferred]);

			assert.equal(typeof execution.then, 'function');
		});

		it('should stop execution if deferred rejected', function () {
			options.prefilter.push(function (options, result, deferred) {
				deferred.reject();
			});

			execution = executor.buildQueue([options, result, deferred]);

			return execution.fail(function (error) {
				assert.ok(result.prefilterExecuted);
				assert.ok(!result.processResultExecuted);
				assert.ok(error instanceof Error);
				assert.equal(error.message, 'stopped');
			});
		});

		it('should init deferred.progress() before each task', function () {
			var taskNames = ['prefilterTest', 'processResultTest'];
				stageNames = ['prefilter', 'processResult'];
				progressInitCount = 0;

			execution = executor.buildQueue([options, result, deferred]);

			H.returnPromise(deferred).progress(function(progress) {
				assert.ok(taskNames.indexOf(progress.task) > -1);
				assert.ok(stageNames.indexOf(progress.stage) > -1);
				progressInitCount++;
			});

			return execution.then(function (result) {
					assert.equal(progressInitCount, 2);
					assert.ok(result.prefilterExecuted);
					assert.ok(result.processResultExecuted);
				});

		});

	});

	describe('#smartExtend()', function () {
		var obj1 = {param: {value: false}, some: true},
			obj2 = {param: {value: true }},
			obj3 = {additional: true},
			result;

		it('should deeply extend array of objects, passed as argument', function () {
			result = executor.smartExtend([obj1, obj2], obj3);
			assert.deepEqual(result, {param: {value: true}, some: true, additional: true});
			assert.deepEqual(obj1, {param: {value: false}, some: true});
			assert.deepEqual(obj2, {param: {value: true}});
		});

		it('should extend options.anyParam by the rule from executor.extendRules', function () {
			executor.extendRules.some = function () {
				assert.equal(arguments[0], obj1);
				assert.equal(arguments[1], obj2);

				return false;
			};

			executor.extendRules.newParam = function () {
				return 'passed';
			};

			result = executor.smartExtend([obj1, obj2]);
			assert.deepEqual(result, {param: {value: true}, some: false, newParam: 'passed'});
		});

	});

	describe('#queue()', function () {
		it('should build promised chain', function (done) {
			var testFunc1 = function (tstObject) {
				tstObject.some = 'some';
			};

			var testFunc2  = function () {
				var defer = new H.Deferred();
				defer.resolve(5);
				return defer.promise;
			};

			var testObject = {};

			var q = executor.queue(testFunc1.bind(null, testObject), testFunc2);

			assert.ok(q.then);

			q.then(function (value) {
				assert.equal(value, 5);
				assert.equal(testObject.some, 'some');
				done();
			});

		});
	});

	describe('#exec()', function () {
		var optionsChainArg, dataArg, optionsArg, callbackArg,
			buildQueueExecuted, smartExtendExecuted, buildQueue,
			smartExtend, callbackExecuted, result;

		function assertFlags() {
			assert.ok(smartExtendExecuted);
			assert.ok(buildQueueExecuted);
		}

		beforeEach(function () {
			// flag reset
			buildQueueExecuted = false;
			smartExtendExecuted = false;
			callbackExecuted = false;

			// arguments reset
			optionsChainArg = [];
			dataArg = {value: true};
			optionsArg = {};
			callbackArg = function (res) {
				assert.equal(res, result);
				callbackExecuted = true;
			};

			// creating stubs
			buildQueue = function (wiredArgs) {
				var buildDefer = new H.Deferred();

				assert.ok(H.isArray(wiredArgs));
				assert.ok(H.isPlainObject(wiredArgs[0])); // options
				assert.ok(H.isPlainObject(wiredArgs[1])); // result
				assert.equal(typeof wiredArgs[2].resolve, 'function'); // deferred

				result = wiredArgs[1];
				buildDefer.resolve();
				buildQueueExecuted = true;
				return H.returnPromise(buildDefer);
			};

			smartExtend = function (optionsChain, options) {
				assert.equal(optionsChain, optionsChainArg);
				assert.ok(H.isPlainObject(options));
				smartExtendExecuted = true;
				return {};
			};

			executor.buildQueue = buildQueue;
			executor.smartExtend = smartExtend;
		});

		it('should return promise', function () {
			var promise = executor.exec(optionsChainArg);

			assert.equal(typeof promise.then, 'function');
			assertFlags();
		});

		it('can accept data argument', function () {
			executor.smartExtend = function (optionsChain, options) {
				assert.deepEqual(options.data, {value: true});
				return smartExtend.apply(executor, arguments);
			};

			executor.exec(optionsChainArg, dataArg);
			assertFlags();
		});

		it('can accept options arguments only with data', function () {
			executor.smartExtend = function (optionsChain, options) {
				assert.equal(options, optionsArg);
				return smartExtend.apply(executor, arguments);
			};

			executor.exec(optionsChainArg, dataArg, optionsArg);
			assertFlags();
		});

		it('can accept last callback argument', function () {
			return executor.exec(optionsChainArg, dataArg, optionsArg, callbackArg)
				.then(function () {
					assert.ok(callbackExecuted);
					assertFlags();
				});
		});

		it('can accept callback argument instead of options', function () {
			return executor.exec(optionsChainArg, dataArg, callbackArg)
				.then(function () {
					assert.ok(callbackExecuted);
					assertFlags();
				});
		});

		it('can accept callback argument instead of data', function () {
			return executor.exec(optionsChainArg, callbackArg)
				.then(function () {
					assert.ok(callbackExecuted);
					assertFlags();
				});
		});

	});

});