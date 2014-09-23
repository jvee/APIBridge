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

	it('should handle root request', function (done) {
		var options = {
			url: baseUrl
		};

		request(options, function (err, req, res) {
			if (err) return done(err);

			assert.equal(req.statusCode, 200);

			var data = JSON.parse(res);

			assert.equal(data.status, 'ok');
			assert.equal(data.path, '/');

			done();
		});
	});

});

after(function () {
	server.close();
});