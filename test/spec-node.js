var assert = require('assert'),
	Node = require('../lib/node'),
	extend = require('extend'),
	data = require('./data');

describe('Node', function () {
	var nodeDecl = extend(true, {}, data.decl_1_normalized['.layer.handlerOne']),
		nodePath = '.layer.handlerOne',
		modelStub = {
			splitPath: function () {
				return ['.', '.layer', '.layer.handlerOne'];
			},
			getNode: function (nodePath) {
				return this.nodes[nodePath];
			},
			nodes: {
				'.layer': extend(true, {}, data.decl_1_normalized['.layer']),
				'.': extend(true, {}, data.decl_1_normalized['.'])
			}
		},
		node;

	beforeEach(function () {
		node = new Node({
			pathCascade: [ '.', '.layer', '.layer.handlerOne' ],
			model: modelStub,
			nodeType: 'handler',
			options: nodeDecl
		});
	});

	describe('initialize', function () {
		it('should construct object', function () {
			assert.equal(node.name, 'handlerOne');
			assert.equal(node.nodeType, 'handler');
			assert.equal(node.path, '.layer.handlerOne');
			assert.deepEqual(node.parents, ['.', '.layer']);
		});

		it('should accept string as options and convert it to options.url', function () {
			node = new Node({
				pathCascade: [ '.', '.layer', '.layer.handlerOne' ],
				model: modelStub,
				nodeType: 'handler',
				options: 'passed/url'
			});

			assert.equal(node.options.url, 'passed/url');
		});

		it('should accept function as options and convert it to options.transport', function () {
			var testTransport = function () {};

			node = new Node({
				pathCascade: [ '.', '.layer', '.layer.handlerOne' ],
				model: modelStub,
				nodeType: 'handler',
				options: testTransport
			});

			assert.equal(node.options.transport, testTransport);
		});
	});

	describe('#getNameFromPath()', function () {
		it('should parse nodePath and return it\'s name', function () {
			assert.equal(node.getNameFromPath('.layer.handler'), 'handler');
			assert.equal(node.getNameFromPath('.layer'), 'layer');
			assert.equal(node.getNameFromPath('.'), '');
		});
	});

	describe('#getParent()', function () {
		it('should return parent node without arguments', function () {
			assert.equal(node.getParent(), modelStub.nodes['.layer']);
		});

		it('should return node from path in arguments', function () {
			assert.equal(node.getParent('.'), modelStub.nodes['.']);
		});

		it('should return undefined with wrong argument', function () {
			assert.equal(node.getParent('.test'), undefined);
		});
	});

	describe('#getParents()', function () {
		it('should retunr array with all parents nodes', function () {
			assert.deepEqual(node.getParents(), [modelStub.nodes['.'], modelStub.nodes['.layer']]);
		});
	});

	describe('#setModel()', function () {
		it('should add method #getModel(), that returns api\'s model instance from closure', function () {
			assert.equal(node.getModel(), modelStub);
		});
	});

	describe('#getOptionsChain()', function () {
		it('should return array of options of all parents and current node in right order', function () {
			var optionsChain;

			modelStub.nodes['.'].options = {
				cascade: modelStub.nodes['.'].cascade
			};
			modelStub.nodes['.layer'].options = {
				cascade: modelStub.nodes['.layer'].cascade
			};

			optionsChain = node.getOptionsChain();

			assert.equal(optionsChain.length, 3);
			assert.equal(optionsChain[0].cascade.rootLevel, true);
			assert.equal(optionsChain[1].cascade.layerLevel, true);
			assert.equal(optionsChain[2].cascade.handlerLevel, true);
		});
	});

	describe('#setOption()', function () {
		beforeEach(function () {
			node.options = {initValue: true};
		});

		it('should set options with a given value', function () {
			node.setOption('initValue', false);
			assert.deepEqual(node.options, {initValue: false});

			node.setOption('nested', {value: true});
			assert.deepEqual(node.options, {
				initValue: false,
				nested: {value: true}
			});

			node.setOption('nested', {replace: true});
			assert.deepEqual(node.options, {
				initValue: false,
				nested: {replace: true}
			});

			node.setOption('nested', {value: true}, true);
			assert.deepEqual(node.options, {
				initValue: false,
				nested: {
					replace: true,
					value: true
				}
			});
		});

		it('should accept one string argument and delete options.param', function () {
			node.setOption('initValue');
			assert.deepEqual(node.options, {});
		});

	});

	describe('#getOption()', function () {

		beforeEach(function () {
			node.options = {initValue: true};
		});

		it('should return value of requested param', function () {
			assert.equal(node.getOption('initValue'), true);
			assert.equal(node.getOption('wrong'), undefined);
		});

		it('should return whole options object with no parameters passed', function () {
			assert.deepEqual(node.getOption(), {initValue: true});
		});

	});

});