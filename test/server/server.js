var express = require('express'),
	app = express(),
	config = require('./config');


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