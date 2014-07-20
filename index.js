var url = require('url'),
    querystring = require('querystring');

/**
 * @typedef {Object} APIObject
 * @property {Object} models
 */


/**
 * [APIBridge description]
 * @param {APIObject} APIObject описание будущего API
 */
function APIbridge(APIObject) {

    var models = APIObject.models,
        result = {},
        model, method;


    // APIObject.model.keys?
    // Convert to array
    for (model in models) {
        if (models.hasOwnProperty(model)) {

            result[model] = {};

            for (method in models[model]) {
                console.log('[' + model + ']: ', method);

                result[model][method] = createAPIMethod(models[model][method], APIObject);

            }

        }
    }

    console.log(result);
    return result;

}

function createAPIMethod(APIMethodOptions, APIObject) {
    var methodURL = url.resolve(APIObject.base, APIMethodOptions.url || APIMethodOptions);

    return function(params, callback) {

        // console.log(querystring.stringify(undefined));
        methodURL += '?' + querystring.stringify(params);

        console.log(methodURL);
    };
}

module.exports = APIbridge;