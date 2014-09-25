var assert = require('assert'),
	APINode = require('../lib/api-node'),
	extend = require('extend'),
	data = require('./data'),
	apiNodeDecl = extend(true, {}, data.decl_1_normalized['.locations.search']),
	apiNodePath = '.locations.search',
	apiNode,
	treeStub = {
		splitPath: function () {
			return ['.', '.locations', '.locations.search'];
		},
		getNode: function (nodePath) {
			return this.nodes[nodePath];
		},
		nodes: {
			'.locations': extend(true, {}, data.decl_1_normalized['.locations']),
			'.': extend(true, {}, data.decl_1_normalized['.'])
		}
	};

describe('APINode', function () {

	beforeEach(function () {
		apiNode = new APINode(apiNodeDecl, apiNodePath, treeStub);
	});

	it('should construct object', function () {
		assert.equal(apiNode.name, 'search');
		assert.equal(apiNode.nodeType, 'endpoints');
		assert.equal(apiNode.path, '.locations.search');
		assert.deepEqual(apiNode.parents, ['.', '.locations']);
	});

	describe('APINode#copyOptions()', function () {
		it('should copy declared options and ignore some from defaults', function () {
			assert.equal(apiNode.options.name, undefined);
			assert.equal(apiNode.options.nodeType, undefined);
			assert.equal(apiNode.options.url, 'locations/search');
		});
	});

	describe('APINode#getParent()', function () {
		it('should return parent node without arguments', function () {
			assert.equal(apiNode.getParent(), treeStub.nodes['.locations']);
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
			assert.deepEqual(apiNode.getParents(), [treeStub.nodes['.'], treeStub.nodes['.locations']]);
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

			treeStub.nodes['.'].options = { baseUrl: 'https://api' };
			treeStub.nodes['.locations'].options = {};

			optionsChain = apiNode.getOptionsChain();

			assert.equal(optionsChain.length, 3);
			assert.ok(optionsChain[0].baseUrl);
			assert.ok(optionsChain[2].url);
		});
	});

});