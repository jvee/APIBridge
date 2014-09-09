var assert = require('assert'),
	normalizer = require('../lib/api-normalizer'),
	data = require('./data'),
	decl_1 = data.decl_1,
	decl_1_normalized = data.decl_1_normalized;

describe('APINormalizer', function () {

	describe('Common', function () {
		it('should export a function', function () {
			assert.equal(typeof normalizer, 'function');
		});
	});

	describe('Result', function () {
		it('should work with basic api description', function () {
			assert.deepEqual(normalizer(decl_1), decl_1_normalized);
		});
	});

});
