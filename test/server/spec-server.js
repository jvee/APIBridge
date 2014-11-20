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
			data: { queryParam: 'someValue' }
		};

		rGet(options, done, function (data, req) {
			assert.equal(req.statusCode, 200);
			assert.equal(data.status, 'ok');
			assert.equal(data.path, '/');
			assert.equal(data.query.queryParam, 'someValue');
			assert.equal(data.method, 'GET');

			done();
		});
	});

	it('should handle root "POST" request', function (done) {
		var options = {
			url: baseUrl,
			qs: { queryParam: 'someValue' },
			data: { bodyParam: 'someValue' }
		};

		rPost(options, done, function (data, req) {
			assert.equal(req.statusCode, 200);
			assert.equal(data.status, 'ok');
			assert.equal(data.path, '/');
			assert.equal(data.body.bodyParam, 'someValue');
			assert.equal(data.body.queryParam, undefined);
			assert.equal(data.method, 'POST');

			done();
		});
	});

	it('should respnse with statusCode passed as parameter "code"', function (done) {
		var options = {
			url: baseUrl,
			data: { code: 500 }
		};

		rGet(options, done, function (data, req) {
			assert.equal(req.statusCode, 500);

			rPost(options, done, function (data, req) {
				assert.equal(req.statusCode, 500);
				done();
			});
		});
	});

	it('should response with statusCode passed as url parameter to /status/:code', function (done) {
		var options = {
			url: baseUrl + 'status/404',
		};

		rGet(options, done, function (data, req) {
			assert.equal(req.statusCode, 404);

			rPost(options, done, function (data, req) {
				assert.equal(req.statusCode, 404);
				done();
			});
		});
	});

});

after(function () {
	server.close();
});

/* -------------------------------------------------- */
/*                    Helpers                         */
/* -------------------------------------------------- */

function requester(method, options, done, callback) {
	if (!options) options = {};

	if (typeof callback !== 'function') throw new Error('Probably "done" not provided');

	options = JSON.parse(JSON.stringify(options));

	options.method = method;

	if (options.data) {
		if (method == 'GET') {
			options.qs = options.data;
		} else {
			options.form = options.data;
		}
	}

	request(options, function (err, req, res) {
		if (err) done(err);

		var data = JSON.parse(res);

		callback(data, req);
	});
}

function rGet(options, done, callback) {
	return requester('GET', options, done, callback);
}

function rPost(options, done, callback) {
	return requester('POST', options, done, callback);
}