var assert = require('assert'),
	serverConfig = require('../server/config'),
	server = require('../server/server'),
	transport = require('../../lib/plugins/transport.js');

describe('plugins/transport', function () {
	var testHost;

	before(function () {
		server = server.listen(serverConfig.port);
		testHost = 'http://' + serverConfig.host + ':' + serverConfig.port + '/';
	});

	after(function (done) {
		server.close(done);
	});

	it('should return promise', function () {
		assert.equal(typeof transport({url: testHost}).then, 'function');
	});

	it('should return nothing if options.transport passed', function () {
		assert.equal(typeof transport({transport: true}), 'undefined');
	});

	it('should fail if server responded with error status code', function () {
		return transport({url: testHost, data: {code: 404}})
			.fail(function (result) {
				assert.ok(result.error);
				assert.equal(result.status, 404);
			});
	});

	it('should fail if requested unreachable host', function () {
		return transport({url: 'http://localhost/unreachable'})
			.fail(function (result) {
				assert.ok(result.error);
			});
	});

	it('should return correct result strucutre', function () {
		return transport({url: testHost})
			.then(function (result) {
				assert.equal(result.status, 200);
				assert.equal(typeof result.statusText, 'string');
				assert.equal(typeof result.data, 'object');
				assert.equal(typeof result.request, 'object');
				assert.equal(typeof result.headers, 'object');
			});
	});

	it('should accept type (request method) option', function () {
		return transport({url: testHost, type: 'POST'})
			.then(function (result) {
				assert.equal(result.data.method, 'POST');
			});
	});

});