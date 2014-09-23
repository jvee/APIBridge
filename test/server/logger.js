var logger = require('morgan');

// POST ?
// COLOR ?
logger.token('query', function (req, res) {
	return JSON.stringify(req.query);
});

logFormat = [
	'   :method :url :status :response-time ms',
	'   Query: :query',
	'--------------------------------------------------------------'
].join(' \\n');

module.exports = logger(logFormat);