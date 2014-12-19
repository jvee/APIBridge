var assert = require('assert'),
    urlTemplate = require('../../lib/helpers/url-template'),
    urlBuilder = urlTemplate.UrlBuilder;

describe('UrlBuilder', function () {

    describe('Common', function () {

        it('should export a function', function () {

            assert.equal(typeof urlBuilder, 'object');

        });

    });

    describe('#getUrlParams()', function () {

        it('should return right data for "test"', function () {
            var result = urlBuilder.getUrlParams('test');

            assert.equal(typeof result, 'object');
            assert.equal(result.length, 0);
        });

        it('should return right data for "test/:id"', function () {
            var result = urlBuilder.getUrlParams('test/:id');

            assert.equal(typeof result, 'object');
            assert.equal(result.length, 1);
            assert.equal(result[0].name, 'id');
            assert.equal(result[0].replacesStr, ':id');
            assert.equal(result[0].required, true);
        });

        it('should return right data for "test/:id/:di"', function () {
            var result = urlBuilder.getUrlParams('test/:id/:di/');

            assert.equal(typeof result, 'object');
            assert.equal(result.length, 2);

            assert.equal(result[0].name, 'id');
            assert.equal(result[0].replacesStr, ':id');
            assert.equal(result[0].required, true);

            assert.equal(result[1].name, 'di');
            assert.equal(result[1].replacesStr, ':di');
            assert.equal(result[1].required, true);
        });

    });

    describe('#setUrlParams()', function () {

        it('should return right data for a single param', function () {
            var UrlParamDescArray = [{
                name: 'id'
            }],
                params = {
                    id: 231
                },
                result = urlBuilder.setUrlParams(UrlParamDescArray, params);

            assert.equal(result[0].value, 231);
            assert.deepEqual(params, {});

        });

        it('should return right data for a multiple params', function () {
            var UrlParamDescArray = [{
                name: 'id',
            }, {
                name: 'di'
            }],
                params = {
                    id: 231,
                    di: 123,
                    newId: 0,
                    oldId: '3'
                },
                result = urlBuilder.setUrlParams(UrlParamDescArray, params);

            assert.equal(result[0].value, 231);
            assert.equal(result[1].value, 123);
            assert.deepEqual(params, {
                newId: 0,
                oldId: '3'
            });

        });

    });


    describe('#stringifyBaseUrl()', function () {
        it('should return rigth data', function () {

            var result = urlBuilder.stringifyBaseUrl('test/:id', [{
                name: 'id',
                value: '123',
                replacesStr: ':id'
            }]);

            assert.equal(typeof result, 'string');
            assert.equal(result, 'test/123');

            result = urlBuilder.stringifyBaseUrl('test/:id/:di', [{
                name: 'id',
                value: '123',
                replacesStr: ':id'
            }, {
                name: 'di',
                value: 0,
                replacesStr: ':di'
            }]);

            assert.equal(result, 'test/123/0');

        });
    });

    describe('#build()', function () {
        var result;

		it('should pass test for (test/:id)', function () {
			result = urlBuilder.build('test/:id', {
				id: 123
			});

			assert.equal(result, 'test/123');
		});

		it('should pass test for (test/:id/:di)', function () {
			result = urlBuilder.build('test/:id/:di', {
				id: 123,
				di: 0
			});

			assert.equal(result, 'test/123/0');
		});

		it('should pass test for (test/:id + query di) ', function () {
			result = urlBuilder.build('test/:id', {
				id: 123,
				di: 0
			});

			assert.equal(result, 'test/123?di=0');
		});

		it('should pass test for (test/:id?newId=0 + query di)', function () {
			result = urlBuilder.build('test/:id?newId=0', {
				id: 123,
				di: 0
			});

			assert.equal(result, 'test/123?newId=0&di=0');
		});
    });

});

describe('urlTemplate', function () {
    var result;

    // merge describe('UrlBuilder')
    it('should work similar to UrlBuilder.build', function () {
        var options = {
            url: 'test/:id',
            data: {
                id: 123
            }
        };

        result = urlTemplate(options);
        assert.equal(result, 'test/123');
    });
});