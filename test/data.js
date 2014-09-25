var config = require('./server/config'),
	testHost = 'http://' + config.host + ':' + config.port + '/';

module.exports = {
	testHost: testHost,

	decl_1: {
		name: 'TestAPI',
		baseURL: testHost,
		dataType: 'json',
		cascade: { rootLevel: true },
		models: [{
					name: 'layer',
					cascade: { layerLevel: true },
					endpoints: [{
									name: 'handlerOne',
									cascade: { handlerLevel: true },
									url: testHost + 'layer/handlerOne'
								},{
									name: 'handlerTwo',
									cascade: { handlerLevel: true },
									url: testHost + 'layer/handlerTwo'
								},{
									name: 'handlerThree',
									cascade: { handlerLevel: true },
									url: testHost + 'layer/handlerThree'
								}]
				}]
	},

	decl_1_normalized: {
		'.': {
			name: 'TestAPI',
			baseURL: testHost,
			dataType: 'json',
			nodeType: 'root',
			cascade: { rootLevel: true  }
		},
		'.layer': {
			name: 'layer',
			cascade: { layerLevel: true },
			nodeType: 'models'
		},
		'.layer.handlerOne': {
			name: 'handlerOne',
			cascade: { handlerLevel: true },
			url: testHost + 'layer/handlerOne',
			nodeType: 'endpoints'
		},
		'.layer.handlerTwo': {
			name: 'handlerTwo',
			cascade: { handlerLevel: true },
			url: testHost + 'layer/handlerTwo',
			nodeType: 'endpoints'
		},
		'.layer.handlerThree': {
			name: 'handlerThree',
			cascade: { handlerLevel: true },
			url: testHost + 'layer/handlerThree',
			nodeType: 'endpoints'
		}
	}
};