var express = require('express'),
	app = express(),
	logger = require('./logger'),
	bodyParser = require('body-parser'),
	config = require('./config');

app.use(bodyParser.urlencoded({ extended: true }));

if (process.argv.indexOf('--log') > 0) {
	app.use(logger);
}

// setting response status
app.all('*', setStatusCode);
app.all('/status/:code', setStatusCode);


app.all('*', function (req, res) {
	res.json({
		name: 'Test Server',
		status: 'ok',
		path: req.path,
		body: req.body,
		query: req.query,
		headers: req.headers,
		method: req.method
	});
});

if (!module.parent) {
	app.listen(config.port);
} else {
	module.exports = app;
}

/**
 * Setting status code middleware depended on request params
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function setStatusCode(req, res, next) {
	var code = parseInt(req.param('code'), 10);

	if (isStatusCode(code)) {
		res.status(code);
	}

	next();
}
/**
 * Checking value for statusCode
 * @param  {Number}  code
 * @return {Boolean}
 */
function isStatusCode(code) {
	return typeof code === 'number' && !isNaN(code) && code > 99 && code < 1000;
}