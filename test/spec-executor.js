var assert = require('assert'),
	Executor = require('../lib/executor');

/**
 * @todo
 * Протестировать остальные методы Executor
 * в queue поддержать проброс промисовых объектов
 * протестировать массивы в proccessResult
 * Тестировать optionsCascade в другом месте,
 * Протестировать инициализацию модуля
 */


describe('Executor', function () {

	var executor;

	beforeEach(function () {
		executor = new Executor({context: true}, null, {});
	});

	describe('#addStageToQueue()', function () {
		var taskQueue = [],
			stage = {
				name: 'someStage',
				argument: 'response'

			},
			stage2 = {
				name: 'anotherStage',
				argument: 'response'
			},
			wiredArgs = [
				//options
				{
					someStage: testFunc,
					anotherStage: [ testFunc, testFunc ],
					ctx: {
						context: true
					}
				},
				// response
				{}
			];

		function testFunc(options, response) {
			assert.deepEqual(this, {context: true});
			assert.equal(options, wiredArgs[0]);
			assert.equal(response, wiredArgs[1]);
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

		it('Should accept array of functions passed as executorInstance#innerScope.stageName', function () {
			var stage3 = {
					name: 'innerStage',
					argument: 'response',
					isInnerScope: true
				};

			executor.innerScope.ctx = { context: true };

			executor.innerScope['innerStage'] = [function (options, response) {
				assert.equal(options, wiredArgs[0]);
				assert.equal(response, wiredArgs[1]);
				assert.equal(this, executor.innerScope.ctx);
			}];

			executor.addStageToQueue(taskQueue, stage3, wiredArgs);

			assert.equal(taskQueue.length, 4);

			taskQueue[3]();
		});
	});

	describe('#buildQueue()', function () {
		var taskQueue, options, response;

		beforeEach(function () {
			taskQueue = [];
			options = {
				prefilter: function () {},
				processResult: function () {}
			};
			response = {};
			executor.innerScope.processTransport = undefined;
		});

		it('should pass right arguments to #addStageToQueue()', function () {
			executor.addStageToQueue = function (passedTaskQueue, passedStage, passedWiredArgs) {
				assert.equal(passedTaskQueue, taskQueue);
				assert.ok(executor.stages.indexOf(passedStage) >= 0);
				assert.equal(passedWiredArgs[0], options);
				assert.equal(passedWiredArgs[1], response);
			};

			executor.buildQueue(taskQueue, [options, response]);
		});

		it('should push functions to task queue array and return it', function () {
			var result = executor.buildQueue(taskQueue, [options, response]);

			assert.equal(result, taskQueue);
			assert.equal(taskQueue.length, 2);
			assert.notEqual(taskQueue[0], options.prefilter);
			assert.notEqual(taskQueue[1], options.precessResult);
		});
	});

	describe('#smartExtend()', function () {
		var obj1 = {param: {value: false}, some: true},
			obj2 = {param: {value: true }},
			result;

		it('should deeply extend array of objects, passed as argument', function () {
			result = executor.smartExtend([obj1, obj2]);
			assert.deepEqual(result, {param: {value: true}, some: true});
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

	describe('#exec()', function () {

		var serverConfig = require('./server/config'),
			server, execRun, optionsChain;

		before(function () {
			server = require('./server/server').listen(serverConfig.port);
		});

		after(function () {
			server.close();
		});

		beforeEach(function () {
			optionsChain = [
				{
					cascade: {
						rootLevel: true
					}
				},
				{
					cascade: {
						layerLevel: true
					}
				},
				{
					cascade: {
						handlerLevel: true
					},
					url: 'http://' + serverConfig.host + ':' + serverConfig.port
				}
			];

			// @see APITree#exportnEndpoint()
			execRun = executor.exec.bind(executor, optionsChain);
		});

		it('should return function', function () {
			assert.equal(typeof executor.exec, 'function');
		});

		it('should return promise', function () {
			assert.equal(typeof execRun().then, 'function');
		});

		it('should create request', function () {
			return execRun()
				.then(function (response) {
					assert.equal(response.request.status, 200);
				});
		});

		it('should accept options.prefilter function', function () {
			var prefilterExecuted = false,
				options = {};

			options.prefilter = function (options, response) {
				options.data.prefiltered = true;
				assert.deepEqual(options.cascade, {
					rootLevel: true,
					layerLevel: true,
					handlerLevel: true
				});
				assert.equal(this.context, true);
				prefilterExecuted = true;
			};

			return execRun({prefiltered: false}, options)
				.then(function (response) {
					assert.equal(response.data.query.prefiltered, 'true');
					assert.equal(prefilterExecuted, true);
				});
		});

		it('should accept options.processResult function', function () {
			var processExecuted = false,
				options = {};

			options.processResult = function (options, response) {
				processExecuted = true;
				assert.ok(response.data);
				assert.ok(response.request);
				assert.equal(this.context, true);

				return response.data;
			};

			return execRun({code: 200}, options)
				.then(function (response) {
					assert.deepEqual(response.query, { code: 200 });
					assert.equal(processExecuted, true);
				});
		});

		it('should exec promise.fail if executed with wrong params', function () {
			return execRun({ code: 404 })
				.fail(function (response) {
					assert.equal(response.status, 404);
				});
		});

		it('should execute callback on success before #then()', function () {
			var callbackExecuted = false;

			return execRun({}, function (response) {
				assert.equal(this.context, true);
				callbackExecuted = true;
			}).then(function () {
				assert.equal(callbackExecuted, true);
			});
		});

		it('should execute callback on error before #fail()', function () {
			var callbackExecuted = false;

			return execRun({ code: 404 }, function (response) {
				assert.equal(this.context, true);
				callbackExecuted = true;
			}).fail(function () {
				assert.equal(callbackExecuted, true);
			});
		});

		// it('should exec promise.fail if options.prefilter returns false', function () {});

	});

});