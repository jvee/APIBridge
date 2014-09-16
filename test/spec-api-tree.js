var assert = require('assert'),
	APITree = require('../lib/api-tree'),
	data = require('./data'),
	decl_1_normalized = data.decl_1_normalized,
	tree;

describe('APITree', function () {

	before(function () {
		tree = new APITree(decl_1_normalized);
	});

	describe('Common', function () {
		it('should export a function', function () {
			assert.equal(typeof APITree, 'function');
		});
	});

	describe('Result', function () {
		it('shoul build object with nodes', function () {
			assert.ok(tree.nodes);
			assert.ok(tree.nodes['.']);
			assert.ok(tree.nodes['.locations']);
			assert.ok(tree.nodes['.locations.get']);
			assert.ok(tree.nodes['.locations.search']);
			assert.ok(tree.nodes['.locations.recent']);
		});
	});

	describe('#getNode()', function () {
		it('should correctly return requested node', function () {
			assert.equal(tree.getNode('.locations').name , 'locations');
			assert.equal(tree.getNode('.locations.search').name, 'search');
			assert.equal(tree.getNode('.').name, 'Instagram');
		});

		it('should return "undefined" with wrong arguments', function () {
			assert.equal(tree.getNode('.some.wrong.path'), undefined);
			assert.equal(tree.getNode(''), undefined);
			assert.equal(tree.getNode(), undefined);
		});
	});

	describe('#splitPath()', function () {
		it('should correctly define all nodes paths', function () {
			assert.deepEqual(tree.splitPath('.'), ['.']);
			assert.deepEqual(tree.splitPath('.test'), ['.', '.test']);
			assert.deepEqual(tree.splitPath('.test.really.long'), ['.', '.test', '.test.really', '.test.really.long']);
		});

		it('should return empty array with wrong arguments', function () {
			assert.deepEqual(tree.splitPath(), []);
		});
	});

	describe('#isChildOf()', function () {
		it('should return correct result', function () {
			var rootNode = tree.getNode('.'),
				locationsNode = tree.getNode('.locations'),
				searchNode = tree.getNode('.locations.get');
			assert.equal(tree.isChildOf(rootNode, locationsNode), true);
			assert.equal(tree.isChildOf(locationsNode, rootNode), false);
			assert.equal(tree.isChildOf(rootNode, searchNode), false);
		});
	});

	describe('#export()', function () {
		it('should export correct strucutre', function () {
			var exportedTree = tree.export();
			assert.equal(typeof exportedTree, 'object');
			assert.equal(typeof exportedTree.locations, 'object');
			assert.equal(typeof exportedTree.locations.get, 'function');
			assert.equal(typeof exportedTree.locations.recent, 'function');
			assert.equal(typeof exportedTree.locations.search, 'function');
		});
	});

	describe('#exportEndpoint()', function () {
		it('should return function', function () {
			var node = tree.getNode('.locations.get');
			assert.equal(typeof tree.exportEndpoint(node), 'function');
		});
	});

});