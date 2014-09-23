var logger = require('morgan');
var tokens = ['query', 'body', 'headers'];

tokens.forEach(function(token, index) {
	logger.token(token, function (req, res) {
		return JSON.stringify(req[token], null, '\t').replace(/\}$/, '   }');
	});
});

var logFormat = [
	'--------------------------------------------------------------------------',
	'   :method :url :status :response-time ms',
	'   Query: :query',
	'   Body: :body',
	'   Headers: :headers',
	'--------------------------------------------------------------------------'
].join(' \\n');

module.exports = logger(logFormat);