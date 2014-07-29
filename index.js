var url = require('url'),
	APIRequest = require('./lib/api-request'),
	urlBuilder = require('./lib/url-builder');

/**
 * @typedef {Object} APIRoot
 * @property {String} name Имя создаваемого API
 * @property {APIModel[]} models
 * @property {APIOptions} options
 */

/**
 * @typedef {Object} APIModel
 */

/**
 * @typedef {Object} APIOptions
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

    // generate request method
    // var APIRequest = new request(APIOBject...)

    return function(params, callback) {

        // build request options
        var options = {
            url: urlBuilder.build(methodURL, params),
            ctx: this
        };

        var apiRequest = new APIRequest(options).send();

        console.log(options.url);
    };
}

module.exports = APIbridge;