var express = require('express'),
	app = express(),
	logger = require('./logger'),
	config = require('./config');

if (process.argv.indexOf('--log') > 0) {
	app.use(logger);
}

app.get('/', function (req, res) {
	res.json({
		name: 'Test Server',
		status: 'ok',
		path: req.path
	});
});

if (process.argv.indexOf('--run') > 0) {
	app.listen(config.port);
}

module.exports = app;