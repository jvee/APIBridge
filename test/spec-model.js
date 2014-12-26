var assert = require('assert'),
	Model = require('../lib/model'),
	data = require('./data'),
	decl_1_normalized = data.decl_1_normalized,
	model;

describe('Model', function () {

	before(function () {
		model = new Model(decl_1_normalized);
	});

	describe('Common', function () {
		it('should export a function', function () {
			assert.equal(typeof Model, 'function');
		});
	});

	describe('Result', function () {
		it('shoul build object with nodes', function () {
			assert.ok(model.nodes);
			assert.ok(model.nodes['.']);
			assert.ok(model.nodes['.layer']);
			assert.ok(model.nodes['.layer.handlerTwo']);
			assert.ok(model.nodes['.layer.handlerOne']);
			assert.ok(model.nodes['.layer.handlerThree']);
		});
	});

	describe('#fetchNodes', function () {
		it('should return nodes object with undeclared nodes', function () {

			var apiDecl = {
				'.layer.sublayer.handler': {}
			};

			var result = model.fetchNodes(apiDecl);

			assert.ok(result['.']);
			assert.ok(result['.layer']);
			assert.ok(result['.layer.sublayer']);
			assert.ok(result['.layer.sublayer.handler']);
		});
	});

	describe('#getNode()', function () {
		it('should correctly return requested node', function () {
			assert.equal(model.getNode('.layer').name , 'layer');
			assert.equal(model.getNode('.layer.handlerOne').name, 'handlerOne');
			assert.equal(model.getNode('.').name, '');
		});

		it('should return "undefined" with wrong arguments', function () {
			assert.equal(model.getNode('.some.wrong.path'), undefined);
			assert.equal(model.getNode(''), undefined);
			assert.equal(model.getNode(), undefined);
		});
	});

	describe('#splitPath()', function () {
		it('should correctly define all nodes paths', function () {
			assert.deepEqual(model.splitPath('.'), ['.']);
			assert.deepEqual(model.splitPath('.test'), ['.', '.test']);
			assert.deepEqual(model.splitPath('.test.really.long'), ['.', '.test', '.test.really', '.test.really.long']);
		});

		it('should return empty array with wrong arguments', function () {
			assert.deepEqual(model.splitPath(), []);
		});
	});

	describe('#isChildOf()', function () {
		it('should return correct result', function () {
			var rootNode = model.getNode('.'),
				layerNode = model.getNode('.layer'),
				handlerOneNode = model.getNode('.layer.handlerTwo');
			assert.equal(model.isChildOf(rootNode, layerNode), true);
			assert.equal(model.isChildOf(layerNode, rootNode), false);
			assert.equal(model.isChildOf(rootNode, handlerOneNode), false);
		});
	});

	describe('#export()', function () {
		it('should export correct strucutre', function () {
			var exportedModel = model.export();
			assert.equal(typeof exportedModel, 'object');
			assert.equal(typeof exportedModel.layer, 'object');
			assert.equal(typeof exportedModel.layer.handlerOne, 'function');
			assert.equal(typeof exportedModel.layer.handlerTwo, 'function');
			assert.equal(typeof exportedModel.layer.handlerThree, 'function');
		});
	});

	describe('#exportEndpoint()', function () {
		it('should return function', function () {
			// @see Executor#exec for more details;
			var node = model.getNode('.layer.handlerOne');
			assert.equal(typeof model.exportEndpoint(node), 'function');
		});
	});

	describe('#setOption()', function () {
		it('should set root node options', function () {
			model.setOption('some', true);

			assert.equal(model.getNode('.').options.some, true);

			model.setOption('some');

			assert.equal(model.getNode('.').options.some, undefined);
		});

		it('should set options for specified node', function () {
			model.setOption('.layer', 'some', true);

			assert.equal(model.getNode('.layer').options.some, true);

			model.setOption('.layer', 'some');

			assert.equal(model.getNode('.layer').options.some, undefined);
		});
	});


	describe('#getOption', function () {
		it('should return option from root node', function () {
			assert.deepEqual(model.getOption('cascade'), {rootLevel: true});
			assert.deepEqual(model.getOption().cascade, {rootLevel: true});
		});

		it('should return option from specified node', function () {
			assert.deepEqual(model.getOption('.layer','cascade'), {layerLevel: true});
			assert.deepEqual(model.getOption('.layer').cascade, {layerLevel: true});
		});
	});

});