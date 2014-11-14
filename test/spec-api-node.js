var assert = require('assert'),
	APINode = require('../lib/api-node'),
	extend = require('extend'),
	data = require('./data');

describe('APINode', function () {
	var apiNodeDecl = extend(true, {}, data.decl_1_normalized['.layer.handlerOne']),
		apiNodePath = '.layer.handlerOne',
		treeStub = {
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
		apiNode;

	beforeEach(function () {
		apiNode = new APINode({
			pathCascade: [ '.', '.layer', '.layer.handlerOne' ],
			tree: treeStub,
			nodeType: 'handler',
			options: apiNodeDecl
		});
	});

	describe('initialize', function () {
		it('should construct object', function () {
			assert.equal(apiNode.name, 'handlerOne');
			assert.equal(apiNode.nodeType, 'handler');
			assert.equal(apiNode.path, '.layer.handlerOne');
			assert.deepEqual(apiNode.parents, ['.', '.layer']);
		});

		it('should accept string as options and convert it to options.url', function () {
			apiNode = new APINode({
				pathCascade: [ '.', '.layer', '.layer.handlerOne' ],
				tree: treeStub,
				nodeType: 'handler',
				options: 'passed/url'
			});

			assert.equal(apiNode.options.url, 'passed/url');
		});

		it('should accept function as options and convert it to options.transport', function () {
			var testTransport = function () {};

			apiNode = new APINode({
				pathCascade: [ '.', '.layer', '.layer.handlerOne' ],
				tree: treeStub,
				nodeType: 'handler',
				options: testTransport
			});

			assert.equal(apiNode.options.transport, testTransport);
		});
	});

	describe('#getNameFromPath()', function () {
		it('should parse nodePath and return it\'s name', function () {
			assert.equal(apiNode.getNameFromPath('.layer.handler'), 'handler');
			assert.equal(apiNode.getNameFromPath('.layer'), 'layer');
			assert.equal(apiNode.getNameFromPath('.'), '');
		});
	});

	describe('#getParent()', function () {
		it('should return parent node without arguments', function () {
			assert.equal(apiNode.getParent(), treeStub.nodes['.layer']);
		});

		it('should return node from path in arguments', function () {
			assert.equal(apiNode.getParent('.'), treeStub.nodes['.']);
		});

		it('should return undefined with wrong argument', function () {
			assert.equal(apiNode.getParent('.test'), undefined);
		});
	});

	describe('#getParents()', function () {
		it('should retunr array with all parents nodes', function () {
			assert.deepEqual(apiNode.getParents(), [treeStub.nodes['.'], treeStub.nodes['.layer']]);
		});
	});

	describe('#setTree()', function () {
		it('should add method #getTree(), that returns APIShadowTree instance from closure', function () {
			assert.equal(apiNode.getTree(), treeStub);
		});
	});

	describe('#getOptionsChain()', function () {
		it('should return array of options of all parents and current node in right order', function () {
			var optionsChain;

			treeStub.nodes['.'].options = {
				cascade: treeStub.nodes['.'].cascade
			};
			treeStub.nodes['.layer'].options = {
				cascade: treeStub.nodes['.layer'].cascade
			};

			optionsChain = apiNode.getOptionsChain();

			assert.equal(optionsChain.length, 3);
			assert.equal(optionsChain[0].cascade.rootLevel, true);
			assert.equal(optionsChain[1].cascade.layerLevel, true);
			assert.equal(optionsChain[2].cascade.handlerLevel, true);
		});
	});

	describe('#setOption()', function () {
		beforeEach(function () {
			apiNode.options = {initValue: true};
		});

		it('should set options with a given value', function () {
			apiNode.setOption('initValue', false);
			assert.deepEqual(apiNode.options, {initValue: false});

			apiNode.setOption('nested', {value: true});
			assert.deepEqual(apiNode.options, {
				initValue: false,
				nested: {value: true}
			});

			apiNode.setOption('nested', {replace: true});
			assert.deepEqual(apiNode.options, {
				initValue: false,
				nested: {replace: true}
			});

			apiNode.setOption('nested', {value: true}, true);
			assert.deepEqual(apiNode.options, {
				initValue: false,
				nested: {
					replace: true,
					value: true
				}
			});
		});

		it('should accept one string argument and delete options.param', function () {
			apiNode.setOption('initValue');
			assert.deepEqual(apiNode.options, {});
		});

	});

	describe('#getOption()', function () {

		beforeEach(function () {
			apiNode.options = {initValue: true};
		});

		it('should return value of requested param', function () {
			assert.equal(apiNode.getOption('initValue'), true);
			assert.equal(apiNode.getOption('wrong'), undefined);
		});

		it('should return whole options object with no parameters passed', function () {
			assert.deepEqual(apiNode.getOption(), {initValue: true});
		});

	});

});