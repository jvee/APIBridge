var assert = require('assert'),
	APITree = require('../lib/api-tree'),
	data = require('./data'),
	decl_1_normalized = data.decl_1_normalized,
	tree, node, exportedEndpoint, request;

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
		// в queue поддержать проброс промисовых объектов
		// подготовить локальный сервер для тестирования

		beforeEach(function () {
			node = tree.getNode('.locations.get');
			// Добавить в tree и тестировать extend
			node.options.data = {
				client_id: '22aaafad8e8447cf883c2cbb55663de5'
			};

			node.options.url = 'https://api.instagram.com/v1/locations/1';
			node.options.prefilter = undefined;
			node.options.processResult = undefined;

			exportedEndpoint = tree.exportEndpoint(node);
		});

		it('should return function', function () {
			assert.equal(typeof exportedEndpoint, 'function');
		});

		it('should return promise', function () {
			assert.equal(typeof exportedEndpoint().then, 'function');
		});

		it('should create request', function (done) {
			exportedEndpoint()
				.then(function (response) {
					assert.equal(response.request.status, 200);

					done();
				});
		});

		it('should accept options.prefilter function', function (done) {
			var prefilterExecuted = false;

			// spy
			node.options.prefilter = function (options) {
				options.url = 'https://api.instagram.com/v1/locations/3';
				prefilterExecuted = true;
			};

			exportedEndpoint()
				.then(function (response) {
					assert.equal(response.data.data.id, '3');
					assert.equal(prefilterExecuted, true);

					done();
				});
		});

		it('should accept options.processResult function', function (done) {
			var processExecuted = false;

			// spy
			node.options.processResult = function (response) {
				processExecuted = true;
				return response.data;
			};

			exportedEndpoint()
				.then(function (response) {
					assert.equal(response.data.id, '1');
					assert.equal(processExecuted, true);

					done();
				});
		});

		it('should exec promise.fail if executed with wrong params', function (done) {
			exportedEndpoint({ client_id: '' /* fail: true для будущего сервера */ })
				.fail(function (response) {
					assert.equal(response.status, 400);
					done();
				});
		});

		// it('should exec promise.fail if options.prefilter returns false', function () {});

	});

});