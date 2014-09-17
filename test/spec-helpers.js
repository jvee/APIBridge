var assert = require('assert'),
	H = require('../lib/helpers');

describe('Helpers', function () {

	describe('#queue()', function () {
		it('should build promised chain', function () {
			var func  = function () {
				var defer = new H.Deferred();

				defer.resolve(5);

				return defer;
			};

			var q = H.queue(func);

			assert.ok(q.then);

			var lastValue;

			q.then(function (value) {
				lastValue = value;
			});

			assert.equal(lastValue, 5);

		});
	});

});