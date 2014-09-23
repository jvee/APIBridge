var logger = require('morgan');

// POST ?
// COLOR ?
logger.token('query', function (req, res) {
	return JSON.stringify(req.query);
});

logger.token('body', function (req, res) {
	return JSON.stringify(req.body);
});

logger.token('headers', function (req, res) {
	return JSON.stringify(req.headers);
});

logFormat = [
	'--------------------------------------------------------------------------',
	'   :method :url :status :response-time ms',
	'   Query: :query',
	'   Body: :body',
	'   Headers: :headers',
	'--------------------------------------------------------------------------'
].join(' \\n');

module.exports = logger(logFormat);