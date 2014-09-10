var assert = require('assert'),
	APINode = require('../lib/api-node'),
	data = require('./data'),
	apiNodeDecl = data.decl_1_normalized['.locations.search'],
	apiNodePath = '.locations.search';
	shadowTreeStub = {
		splitPath: function () {
			return ['.', '.locations', '.locations.search'];
		},
		getNode: function (nodePath) {
			return this.nodes[nodePath];
		},
		nodes: {
			'.locations': data.decl_1_normalized['.locations'],
			'.': data.decl_1_normalized['.']
		}
	};

describe('APINode', function () {

	beforeEach(function () {
		apiNode = new APINode(apiNodeDecl, apiNodePath, shadowTreeStub);
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
			assert.equal(apiNode.getParent(), shadowTreeStub.nodes['.locations']);
		});

		it('should return node from path in arguments', function () {
			assert.equal(apiNode.getParent('.'), shadowTreeStub.nodes['.']);
		});

		it('should return undefined with wrong argument', function () {
			assert.equal(apiNode.getParent('.test'), undefined);
		});
	});

	describe('APINode#getParents', function () {
		it('should retunr array with all parents nodes', function () {
			assert.deepEqual(apiNode.getParents(), [shadowTreeStub.nodes['.'], shadowTreeStub.nodes['.locations']]);
		});
	});

	describe('APINode#setTree()', function () {
		it('should add method #getTree(), that returns APIShadowTree instance from closure', function () {
			assert.equal(apiNode.getTree(), shadowTreeStub);
		});
	});

});