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
			assert.ok(tree.nodes['.layer']);
			assert.ok(tree.nodes['.layer.handlerTwo']);
			assert.ok(tree.nodes['.layer.handlerOne']);
			assert.ok(tree.nodes['.layer.handlerThree']);
		});
	});

	describe('#fetchNodes', function () {
		it('should return nodes object with undeclared nodes', function () {

			var apiDecl = {
				'.layer.sublayer.handler': {}
			};

			var result = tree.fetchNodes(apiDecl);

			assert.ok(result['.']);
			assert.ok(result['.layer']);
			assert.ok(result['.layer.sublayer']);
			assert.ok(result['.layer.sublayer.handler']);
		});
	});

	describe('#getNode()', function () {
		it('should correctly return requested node', function () {
			assert.equal(tree.getNode('.layer').name , 'layer');
			assert.equal(tree.getNode('.layer.handlerOne').name, 'handlerOne');
			assert.equal(tree.getNode('.').name, 'TestAPI');
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
				layerNode = tree.getNode('.layer'),
				handlerOneNode = tree.getNode('.layer.handlerTwo');
			assert.equal(tree.isChildOf(rootNode, layerNode), true);
			assert.equal(tree.isChildOf(layerNode, rootNode), false);
			assert.equal(tree.isChildOf(rootNode, handlerOneNode), false);
		});
	});

	describe('#export()', function () {
		it('should export correct strucutre', function () {
			var exportedTree = tree.export();
			assert.equal(typeof exportedTree, 'object');
			assert.equal(typeof exportedTree.layer, 'object');
			assert.equal(typeof exportedTree.layer.handlerOne, 'function');
			assert.equal(typeof exportedTree.layer.handlerTwo, 'function');
			assert.equal(typeof exportedTree.layer.handlerThree, 'function');
		});
	});

	describe('#exportEndpoint()', function () {
		it('should return function', function () {
			// @see Executor#exec for more details;
			var node = tree.getNode('.layer.handlerOne');
			assert.equal(typeof tree.exportEndpoint(node), 'function');
		});
	});

});