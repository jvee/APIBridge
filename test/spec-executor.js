var assert = require('assert'),
	Executor = require('../lib/executor');

/**
 * @todo
 * Протестировать остальные методы Executor
 * в queue поддержать проброс промисовых объектов
 * в response передавать так же собранные options
 * протестировать массивы в proccessResult
 * Тестировать optionsCascade в другом месте,
 * Протестировать инициализацию модуля
 */


describe('Executor', function () {

	var executor;

	before(function () {
		executor = new Executor({context: true}, null, {});
	});

	describe('#processTransport()', function () {

		it('should extend passed firts argument object with second and return link to first', function () {
			var responseObj = {},
				requestObj = { value: true },
				result;

			result = executor.processTransport(responseObj, requestObj);

			assert.deepEqual(responseObj, { value: true });
			assert.equal(result, responseObj);
		});

	});

	describe('#addStageToQueue()', function () {
		it('should add binded to options.ctx function with wired argument', function () {
			var taskQueue = [],
				stage = {
					name: 'someStage',
					argument: 'response'

				},
				wiredArgs = {
					options: {
						someStage: function (response) {
							assert.deepEqual(this, {context: true});
							assert.equal(response, wiredArgs.response);
						},
						ctx: {
							context: true
						}
					},
					response: {}
				};

			executor.addStageToQueue(taskQueue, stage, wiredArgs);

			assert.equal(taskQueue.length, 1);

			taskQueue[0]();
		});
	});

	describe('#buildQueue()', function () {

	});

	describe('#addExtendRule()', function () {

	});

	describe('#smartExtend()', function () {

	});

	describe('#exec()', function () {

		var serverConfig = require('./server/config'),
			server, execRun;

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
					// check response.options
					assert.equal(response.request.status, 200);
				});
		});

		it('should accept options.prefilter function', function () {
			var prefilterExecuted = false,
				options = {};

			options.prefilter = function (options) {
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

			options.processResult = function (response) {
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