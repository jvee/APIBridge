var assert = require('assert'),
	serverConfig = require('./server/config'),
	server = require('./server/server'),
	apiBridge = require('../lib/api-bridge.js'),
	testHost, apiDecl, api;

describe('apiBridge integration test', function () {

	before(function () {
		server = server.listen(serverConfig.port);
		testHost = 'http://' + serverConfig.host + ':' + serverConfig.port + '/';
	});

	after(function (done) {
		server.close(done);
	});

	beforeEach(function () {
		apiDecl = {
			'.': {
				cascade: {
					rootLevel: true
				},
				prefilter: function (options, response) {
					assert.ok(options.cascade.rootLevel);
					assert.ok(options.cascade.layerLevel);
					assert.ok(options.cascade.handlerLevel);
					assert.equal(this, api);
				},
				processResult: function (options, response) {
					assert.ok(response.data);
					// совсем не нравится "response.request"
					assert.ok(response.request);
					assert.equal(this, api);

					// это не правильно? 
					// хотя может и вариант, т.к это простой способ
					// вынесте из объекта под объект
					return response;
				},
			},

			'.layer': {
				cascade: {
					layerLevel: true
				}
			},

			'.layer.handlerOne': {
				url: testHost + 'layer/handlerOne',
				cascade: {
					handlerLevel: true
				}
			}
		};

		api = apiBridge(apiDecl);
	});

	it('should export correct strucutre', function () {
		assert.ok(api);
		assert.ok(api.layer);
		assert.ok(api.layer.handlerOne);
	});

	describe('API handler', function () {
		var callbackExecuted;
	
		function callback(response) {
			assert.equal(this, api);
			callbackExecuted = true;
		}

		beforeEach(function () {
			callbackExecuted = false;
		});


		it('should be a function', function () {
			assert.equal(typeof api.layer.handlerOne, 'function');
		});

		it('should return promise', function () {
			assert.equal(typeof api.layer.handlerOne().then, 'function');
		});

		it('should create request', function () {
			return api.layer.handlerOne(callback)
				.then(function (response) {
					assert.equal(callbackExecuted, true);
					assert.equal(response.request.status, 200);
				});
		});

		it('should fail if executed with wrong params', function () {
			return api.layer.handlerOne({ code: 404 }, callback)
				.fail(function (response) {
					assert.equal(callbackExecuted, true);
					// не сохранена структура response при then и fail
					assert.equal(response.status, 404);
				});
		});

		// it('should exec promise.fail if options.prefilter returns false', function () {});

	});


});