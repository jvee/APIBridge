var H = require('../helpers');

var isArray = H.isArray;

module.exports = extendFunctions;

function extendFunctions(type) {

	return function (optionsChainItem) {
		var result = [],
			x, z;

		for (x = arguments.length - 1; x >= 0; x--) {
			if (arguments[x][type] === null) {
				break;
			}

			if (!arguments[x][type]) {
				continue;
			}

			if (isArray(arguments[x][type])) {

				for (z = arguments[x][type].length - 1; z >= 0; z--) {
					if (arguments[x][type][z] === null) {
						return result.length > 0 ? result.reverse(): undefined;
					}
					if (typeof arguments[x][type][z] === 'function') {
						result.push(arguments[x][type][z]);
					}
				}

				continue;
			}

			if (typeof arguments[x][type] === 'function') {
				result.push(arguments[x][type]);
			}
		}

		return result.length > 0 ? result.reverse(): undefined;
	};
}