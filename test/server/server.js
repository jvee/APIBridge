var express = require('express'),
	app = express();


app.get('/', function (req, res) {
	res.json({
		name: 'Test Server',
		status: 'ok',
		path: req.path
	});
});

if (process.argv.indexOf('--run') > 0) {
	app.listen(3000);
}

module.exports = app;