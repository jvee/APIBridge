var requirejs = require('requirejs');

var config = {
		baseUrl: __dirname + '/lib',
		name: 'model',
		// в будузем exclude и path не понадобятся, временная хрень
		exclude: ['node-jquery', 'jQuery', 'q', 'extend'],
		paths: {
			'node-jquery': '../node_modules/node-jquery/index',
			'jQuery': '../node_modules/node-jquery/node_modules/jQuery/lib/node-jquery',
			'q': '../node_modules/q/q',
			'extend': '../node_modules/extend/index'
		},
		out: './api.js',
		optimize: 'none',
		findNestedDependencies: true,
		cjsTranslate: true,
		onModuleBundleComplete: function (data) {
			var fs = require('fs'),
			amdclean = require('amdclean'),
			outputFile = data.path;

			fs.writeFileSync(outputFile, amdclean.clean({
				'filePath': outputFile,
				'prefixMode': 'camelCase'
			}));
		}
	};

requirejs.optimize(config, function (buildResponse) {
	//buildResponse is just a text output of the modules
	//included. Load the built file for the contents.
	//Use config.out to get the optimized file contents.
	var contents = fs.readFileSync(config.out, 'utf8');

	console.log(arguments, contents);
}, function(err) {
	console.log(arguments);
	//optimization err callback
});