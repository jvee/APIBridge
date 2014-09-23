var express = require('express'),
	app = express(),
	logger = require('./logger'),
	bodyParser = require('body-parser'),
	config = require('./config');

app.use(bodyParser.urlencoded({ extended: true }));

if (process.argv.indexOf('--log') > 0) {
	app.use(logger);
}

app.all('*', function (req, res) {
	res.json({
		name: 'Test Server',
		status: 'ok',
		path: req.path,
		body: req.body,
		query: req.query,
		headers: req.headers
	});
});

// Просто проверять process
// что-то типа isChildProcess
if (process.argv.indexOf('--run') > 0) {
	app.listen(config.port);
}

module.exports = app;