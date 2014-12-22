/** @namespace */
var UrlBuilder = {};


/**
 * Собирает url c параметрами
 * @param {String} urlBaseString основа url
 * @param {Object} params объект с параметрами
 * @return {String}
 */
UrlBuilder.build = function (urlBaseString, params) {

	var urlParams = this.getUrlParams(urlBaseString),
		result;

	urlParams = this.setUrlParams(urlParams, params);

	result = this.stringifyBaseUrl(urlBaseString, urlParams);

	return result;

};

/**
 * @typedef {Object} UrlParamDesc
 * @property {String} name
 * @property {String} replacesStr
 * @property {Boolean} required
 */


/**
 * [getUrlParameters description]
 * @param  {String} urlBaseString
 * @return {UrlParamDesc[]}
 */
UrlBuilder.getUrlParams = function (urlBaseString) {

    var regExpSearchParam = /(:([^\/]+?))(\/|$|\?)/g,
        result = [],
        param;

    while ((param = regExpSearchParam.exec(urlBaseString)) !== null) {
        if (param[2].match(/^\d+$/) !== null) {
            continue;
        }

        result.push({
            name: param[2],
            replacesStr: param[1],
            required: true
        });
    }

    // console.dir(result);

    return result;
};

/**
 * [setUrlParams description]
 * @param {UrlParamDesc[]} urlParamDescArray
 * @param {Object} params
 * @return {UrlParamDesc[]}
 */
UrlBuilder.setUrlParams = function (urlParamDescArray, params) {
    var x, l, paramName;

    for (x = 0, l = urlParamDescArray.length; x < l; x++) {
        paramName = urlParamDescArray[x].name;

        if (params[paramName] !== null) {
            urlParamDescArray[x].value = params[paramName];
            delete params[paramName];
        }
    }

    return urlParamDescArray;

};

/**
 * [stringifyBaseUrl description]
 * @param  {String} urlBaseString
 * @param  {UrlParamDesc[]} urlParamDescArray
 * @return {String}
 */
UrlBuilder.stringifyBaseUrl = function (urlBaseString, urlParamDescArray) {
    var x, l, urlParamDesc;


    for (x = 0, l = urlParamDescArray.length; x < l; x++) {
        urlParamDesc = urlParamDescArray[x];

        if ((urlParamDesc.value === null) && urlParamDesc.required) {
            throw new Error('No url-param value.');
        }

        urlBaseString = urlBaseString.replace(urlParamDesc.replacesStr, urlParamDesc.value);
    }

    return urlBaseString;

};

function urlTemplate (options, result, deferred) {
    if (options.url && options.data) {
        options.url = UrlBuilder.build(options.url, options.data);
    }

    return options.url;
}


urlTemplate.UrlBuilder = UrlBuilder;

module.exports = urlTemplate;