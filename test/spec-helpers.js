var assert = require('assert'),
	H = require('../lib/helpers');

describe('Helpers', function () {

	describe('#queue()', function () {
		it('should build promised chain', function (done) {
			var testFunc1 = function (tstObject) {
				tstObject.some = 'some';
			};

			var testFunc2  = function () {
				var defer = new H.Deferred();
				defer.resolve(5);
				return defer.promise;
			};

			var testObject = {};

			var q = H.queue(testFunc1.bind(null, testObject), testFunc2);

			assert.ok(q.then);

			q.then(function (value) {
				assert.equal(value, 5);
				assert.equal(testObject.some, 'some');
				done();
			});

		});
	});

	describe("#extendFunctions()", function () {
		var extendFunctions = H.extendFunctions,
			optionsChain, extendFunctionSome, result;

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

});