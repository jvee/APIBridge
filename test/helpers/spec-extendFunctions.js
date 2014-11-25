var assert = require('assert'),
	extendFunctions = require('../../lib/helpers/extendFunctions');

describe('helpers/extendFunctions', function () {
	var optionsChain, extendFunctionSome, result;

	var f1 = function () {},
		f2 = function () {},
		f3 = function () {},
		f4 = function () {};

	beforeEach(function () {
		optionsChain = [{}, {}, {}];
	});
		
	it('shoult return function as a factory', function () {
		assert.equal(typeof extendFunctions(), 'function');
	});

	it('should apply extend rules for passed option of optionsChain', function () {
		extendFunctionSome = extendFunctions('some');

		optionsChain[0]['some'] = [f1, f2];
		optionsChain[1]['some'] = [f3];
		optionsChain[2]['some'] = f4;

		result = extendFunctionSome(optionsChain[0], optionsChain[1], optionsChain[2]);

		assert.equal(result.length, 4);
		assert.equal(result[0], f1);
		assert.equal(result[1], f2);
		assert.equal(result[2], f3);
		assert.equal(result[3], f4);
	});

	it('should apply extend rules for passed options after "null" in optionsChain ', function () {
		extendFunctionSome = extendFunctions('some');

		optionsChain[0]['some'] = [f1, f2];
		optionsChain[1]['some'] = null;
		optionsChain[2]['some'] = f3;

		result = extendFunctionSome(optionsChain[0], optionsChain[1], optionsChain[2]);

		assert.equal(result.length, 1);
		assert.equal(result[0], f3);
	});

	it('should apply extend rules for passed options after "null" in array in optionsChain ', function () {
		extendFunctionSome = extendFunctions('some');

		optionsChain[0]['some'] = [f1, f2];
		optionsChain[1]['some'] = [null, f3];
		optionsChain[2]['some'] = f4;

		result = extendFunctionSome(optionsChain[0], optionsChain[1], optionsChain[2]);

		assert.equal(result.length, 2);
		assert.equal(result[0], f3);
		assert.equal(result[1], f4);
	});

});