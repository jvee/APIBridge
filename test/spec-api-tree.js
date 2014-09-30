var assert = require('assert'),
	APITree = require('../lib/api-tree'),
	data = require('./data'),
	decl_1_normalized = data.decl_1_normalized,
	tree, node, exportedEndpoint, request, server;

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
		// в queue поддержать проброс промисовых объектов

		before(function () {
			var serverConfig = require('./server/config');
			server = require('./server/server').listen(serverConfig.port);
		});

		after(function () {
			server.close();
		});

		beforeEach(function () {
			node = tree.getNode('.layer.handlerOne');

			node.options.prefilter = undefined;
			node.options.processResult = undefined;

			exportedEndpoint = tree.exportEndpoint(node, {context: true});
		});

		it('should return function', function () {
			assert.equal(typeof exportedEndpoint, 'function');
		});

		it('should return promise', function () {
			assert.equal(typeof exportedEndpoint().then, 'function');
		});

		it('should create request', function () {
			return exportedEndpoint()
				.then(function (response) {
					assert.equal(response.request.status, 200);
				});
		});

		it('should accept options.prefilter function', function () {
			var prefilterExecuted = false;

			node.options.prefilter = function (options) {
				options.data.prefiltered = true;
				assert.deepEqual(options.cascade, {
					rootLevel: true,
					layerLevel: true,
					handlerLevel: true
				});
				assert.equal(this.context, true);
				prefilterExecuted = true;
			};

			return exportedEndpoint({prefiltered: false})
				.then(function (response) {
					assert.equal(response.data.query.prefiltered, 'true');
					assert.equal(prefilterExecuted, true);
				});
		});

		it('should accept options.processResult function', function () {
			var processExecuted = false;

			node.options.processResult = function (response) {
				processExecuted = true;
				assert.ok(response.data);
				assert.ok(response.request);
				assert.equal(this.context, true);

				return response.data;
			};

			return exportedEndpoint({code: 200})
				.then(function (response) {
					assert.deepEqual(response.query, { code: 200 });
					assert.equal(processExecuted, true);
				});
		});

		it('should exec promise.fail if executed with wrong params', function () {
			return exportedEndpoint({ code: 404 })
				.fail(function (response) {
					assert.equal(response.status, 404);
				});
		});

		it('should execute callback on success before #then()', function () {
			var callbackExecuted = false;

			return exportedEndpoint({}, function (response) {
				assert.equal(this.context, true);
				callbackExecuted = true;
			}).then(function () {
				assert.equal(callbackExecuted, true);
			});
		});

		it('should execute callback on error before #fail()', function () {
			var callbackExecuted = false;

			return exportedEndpoint({ code: 404 }, function (response) {
				assert.equal(this.context, true);
				callbackExecuted = true;
			}).fail(function () {
				assert.equal(callbackExecuted, true);
			});
		});

		// it('should exec promise.fail if options.prefilter returns false', function () {});

	});

});