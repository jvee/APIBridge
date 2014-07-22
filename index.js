var url = require('url'),
	request = require('request'),
	urlBuilder = require('./lib/url-builder');

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

    // generate request method
    // var APIrequest = new request(APIOBject...)

    return function(params, callback) {

        // console.log(querystring.stringify(undefined));
        methodURL = urlBuilder.build(methodURL, params);

        request({ url: methodURL }, function (err, response) {
			console.log(JSON.parse(response.body));
        });

        console.log(methodURL);
    };
}

module.exports = APIbridge;