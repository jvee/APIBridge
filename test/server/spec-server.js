var assert = require('assert'),
	app = require('./server'),
	request = require('request'),
	config = require('./config'),
	port = config.port,
	baseUrl = 'http://' + config.host + ':' + port + '/',
	server;

before(function () {
	server = app.listen(port);
});

describe('Test Server', function () {

	it('should handle root "GET" request', function (done) {
		var options = {
			url: baseUrl,
			qs: { queryParam: 'someValue' }
		};

		request(options, function (err, req, res) {
			if (err) return done(err);

			assert.equal(req.statusCode, 200);

			var data = JSON.parse(res);

			assert.equal(data.status, 'ok');
			assert.equal(data.path, '/');
			assert.equal(data.query.queryParam, 'someValue');

			done();
		});
	});

	it('should handle root "POST" request', function (done) {
		var options = {
			url: baseUrl,
			qs: { queryParam: 'someValue' },
			form: { bodyParam: 'someValue' }
		};

		request(options, function (err, req, res) {
			if (err) return done(err);

			assert.equal(req.statusCode, 200);

			var data = JSON.parse(res);

			assert.equal(data.status, 'ok');
			assert.equal(data.path, '/');
			assert.equal(data.body.bodyParam, 'someValue');
			assert.equal(data.body.queryParam, undefined);

			done();
		});


	});

});

after(function () {
	server.close();
});