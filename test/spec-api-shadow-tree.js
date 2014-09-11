var assert = require('assert'),
	APIShadowTree = require('../lib/api-shadow-tree'),
	data = require('./data'),
	decl_1_normalized = data.decl_1_normalized,
	shadowTree,
	pathKeys;

describe('APIShadowTree', function () {

	before(function () {
		shadowTree = new APIShadowTree(decl_1_normalized);
	});

	describe('Common', function () {
		it('should export a function', function () {
			assert.equal(typeof APIShadowTree, 'function');
		});
	});

	describe('Result', function () {
		it('shoul build object with nodes', function () {
			// не забыть описать этот момент
			console.log(shadowTree);
		});
	});

	describe('#getNode()', function () {
		it('should correctly return requested node', function () {
			assert.equal(shadowTree.getNode('.locations').name , 'locations');
			assert.equal(shadowTree.getNode('.locations.search').name, 'search');
			assert.equal(shadowTree.getNode('.').name, 'Instagram');
		});

		it('should return "undefined" with wrong arguments', function () {
			assert.equal(shadowTree.getNode('.some.wrong.path'), undefined);
			assert.equal(shadowTree.getNode(''), undefined);
			assert.equal(shadowTree.getNode(), undefined);
		});
	});

	describe('#splitPath()', function () {
		it('should correctly define all nodes paths', function () {
			assert.deepEqual(shadowTree.splitPath('.'), ['.']);
			assert.deepEqual(shadowTree.splitPath('.test'), ['.', '.test']);
			assert.deepEqual(shadowTree.splitPath('.test.really.long'), ['.', '.test', '.test.really', '.test.really.long']);
		});

		it('should return empty array with wrong arguments', function () {
			assert.deepEqual(shadowTree.splitPath(), []);
		});
	});

	describe('#getPathKeys()', function () {

		before(function () {
			pathKeys = shadowTree.getPathKeys();
		});

		it('should return array with all node paths of tree', function () {
			assert.equal(pathKeys.length, 5);
			assert.ok(pathKeys.indexOf('.') + 1);
			assert.ok(pathKeys.indexOf('.locations') + 1);
			assert.ok(pathKeys.indexOf('.locations.search') + 1);
			assert.ok(pathKeys.indexOf('.locations.get') + 1);
			assert.ok(pathKeys.indexOf('.locations.recent') + 1);
		});

		it('should return sorted array', function () {
			var orderedKeys = ['.', '.locations', '.locations.get', '.locations.recent', '.locations.search'];
			assert.deepEqual(pathKeys, orderedKeys);
		});
	});

	describe('#export()', function () {
		it('should export correct strucutre', function () {
			console.log(shadowTree.export());
		});
	});

});