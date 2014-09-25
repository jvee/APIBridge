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
		apiNode = new APINode(apiNodeDecl, apiNodePath, treeStub);
	});

	it('should construct object', function () {
		assert.equal(apiNode.name, 'handlerOne');
		assert.equal(apiNode.nodeType, 'endpoints');
		assert.equal(apiNode.path, '.layer.handlerOne');
		assert.deepEqual(apiNode.parents, ['.', '.layer']);
	});

	describe('APINode#copyOptions()', function () {
		it('should copy declared options and ignore some from defaults', function () {
			assert.equal(apiNode.options.name, undefined);
			assert.equal(apiNode.options.nodeType, undefined);
			assert.equal(apiNode.options.url, data.testHost + 'layer/handlerOne');
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

});