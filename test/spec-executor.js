var assert = require('assert'),
	Executor = require('../lib/executor'),
	H = require('../lib/helpers');

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
		executor = new Executor({
			stages: [
				'prefilter',
				'transport',
				'_transport',
				'processResult'
			],
			_scope: {
				_transport: H.transport
			}
		});
		executor.ctx = {context: true};
	});

	describe('#createTask()', function () {

		it('should retunr function', function () {
			assert.equal(typeof executor.createTask(), 'function');
		});

		it('should retunr function, bound to passed contenxt and array of arguments', function () {

			var argArr = [[], {}],
				context = {},
				task = executor.createTask(function (arg1, arg2) {
					assert.equal(this, context);
					assert.equal(arg1, argArr[0]);
					assert.equal(arg2, argArr[1]);
				}, context, argArr);

			task();
		});

		it('should throw error with passed rejected deferred', function () {

			var deferred = H.Deferred(),
				promise = H.returnPromise(deferred),
				argArr = [[], {}, deferred],
				context = {},
				task = executor.createTask(function () {}, context, argArr);


			deferred.reject();

			assert.throws(task);

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

		it('Should accept array of functions passed as executorInstance#_scope.stageName', function () {
			var stage3 = '_stage';

			executor._scope.ctx = { context: true };

			executor._scope['_stage'] = [function (options, response) {
				assert.equal(options, wiredArgs[0]);
				assert.equal(response, wiredArgs[1]);
				assert.equal(this, executor._scope.ctx);
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
			executor._scope.processTransport = undefined;
		});

		it('should pass right arguments to #addStageToQueue()', function () {
			executor.addStageToQueue = function (passedTaskQueue, passedStage, passedWiredArgs) {
				assert.ok(executor.stages.indexOf(passedStage) >= 0);
				assert.equal(passedWiredArgs[0], options);
				assert.equal(passedWiredArgs[1], response);
			};

			var execution = executor.buildQueue([options, response]);

			assert.equal(typeof execution.then, 'function');
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

	});

});