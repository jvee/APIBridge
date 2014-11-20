var assert = require('assert'),
	serverConfig = require('../server/config'),
	server = require('../server/server'),
	transport = require('../../lib/helpers/transport.js');

describe('helpres/transport', function () {
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

	it('should accept type (request method) option', function () {
		return transport({url: testHost, type: 'POST'})
			.then(function (response) {
				assert.equal(response.data.method, 'POST');
			});
	});

});