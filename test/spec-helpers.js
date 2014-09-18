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

});