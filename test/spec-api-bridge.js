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
			'.': {},

			'.layer': {},

			'.layer.handlerOne': {
				url: testHost + 'layer/handlerOne'
			}
		};

		api = apiBridge(apiDecl);
	});

	it('should export correct strucutre', function () {

		assert.ok(api);
		assert.ok(api.layer);
		assert.ok(api.layer.handlerOne);
		assert.equal(typeof api.layer.handlerOne, 'function');

	});


});