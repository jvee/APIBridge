var assert = require('assert'),
	APINode = require('../lib/api-node'),
	extend = require('extend'),
	data = require('./data'),
	apiNodeDecl = extend(true, {}, data.decl_1_normalized['.layer.handlerOne']),
	apiNodePath = '.layer.handlerOne',
	apiNode,
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
	};

describe('APINode', function () {

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

	describe('APINode#getNameFromPath()', function () {
		it('should parse nodePath and return it\'s name', function () {
			assert.equal(apiNode.getNameFromPath('.layer.handler'), 'handler');
			assert.equal(apiNode.getNameFromPath('.layer'), 'layer');
			assert.equal(apiNode.getNameFromPath('.'), '');
		});
	});

	describe('APINode#getParent()', function () {
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

	describe('APINode#getParents', function () {
		it('should retunr array with all parents nodes', function () {
			assert.deepEqual(apiNode.getParents(), [treeStub.nodes['.'], treeStub.nodes['.layer']]);
		});
	});

	describe('APINode#setTree()', function () {
		it('should add method #getTree(), that returns APIShadowTree instance from closure', function () {
			assert.equal(apiNode.getTree(), treeStub);
		});
	});

	describe('APINode#getOptionsChain()', function () {
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

	describe('APINode#setOptions()', function () {
		beforeEach(function () {
			apiNode.options = {};
			apiNode.options.initValue = true;
		});

		it('should accept one object argument and replace whole options object', function () {
			apiNode.setOptions({ some: true });

			assert.deepEqual(apiNode.options, {
				some: true
			});

			apiNode.setOptions('not object');

			assert.deepEqual(apiNode.options, {
				some: true
			});
		});

		it('should accept new options object and deep flag for extending original object', function () {
			apiNode.setOptions({some: true}, true);

			assert.deepEqual(apiNode.options, {
				some: true,
				initValue: true
			});
		});

		it('should accept one string argument and delete options.param', function () {
			apiNode.setOptions('initValue');

			assert.deepEqual(apiNode.options, {});
		});

		it('should accept two arguments', function () {

			apiNode.setOptions('initValue', 'new value');

			assert.deepEqual(apiNode.options, {
				initValue: 'new value'
			});

			apiNode.setOptions('initValue', {
				nested: true
			});

			assert.deepEqual(apiNode.options, {
				initValue: {
					nested: true
				}
			});

		});

	});

});