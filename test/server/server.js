var express = require('express'),
	app = express();


app.get('/', function (req, res) {
	res.json({
		name: 'Test Server',
		status: 'ok',
		path: req.path
	});
});

module.exports = app;