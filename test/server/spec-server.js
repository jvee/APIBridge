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

	it('should respnse with statusCode passed as parameter "status"', function (done) {
		var options = {
			url: baseUrl,
			form: { code: 500 },
			method: 'POST'
		};

		request(options, function (err, req, res) {
			if (err) return done(err);

			assert.equal(req.statusCode, 500);

			done();
		});
	});

	it('should response with statusCode passed as url parameter to /status/:code', function (done) {
		var options = {
			url: baseUrl + 'status/404',
		};

		request(options, function (err, req, res) {
			if (err) return done(err);

			assert.equal(req.statusCode, 404);

			done();
		});
	});

});

after(function () {
	server.close();
});