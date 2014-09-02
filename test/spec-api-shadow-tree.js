var assert = require('assert'),
	APIShadowTree = require('../lib/api-shadow-tree'),
	mock_1_normalized = {
		'.': {
			name: 'Instagram',
			baseURL: 'https://api.instagram.com/v1/',
			dataType: 'json',
			nodeType: 'root'
		},
		'.locations': {
			name: 'locations',
			nodeType: 'models'
		},
		'.locations.search': {
			name: 'search',
			url: 'locations/search',
			nodeType: 'endpoints'
		},
		'.locations.get': {
			name: 'get',
			url: 'locations/:id',
			nodeType: 'endpoints'
		},
		'.locations.recent': {
			name: 'recent',
			url: 'locations/:id/media/recent',
			nodeType: 'endpoints'
		}
	};

describe('APIShadowTree', function () {

	describe('Common', function () {
		it('should export a function', function () {
			assert.equal(typeof APIShadowTree, 'function');
		});
	});

	describe('Result', function () {
		it('shoul build object with nodes', function () {
			console.log(new APIShadowTree(mock_1_normalized));
		});
	});

});