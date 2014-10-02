var H = require('./helpers');

var defaults = {
	extendRules: {},
	extend: H.extend,
	transport: H.request,
	Deferred: H.Deferred,
	stages: [{
		name: 'transport',
		argument: 'options'
	}, {
		name: 'processRequest',
		argument: 'response'
	}]
};

function Executor(api, tree, options) {
	// ctx и tree передавать в инстанс executor при инициализации
	this.extend(this, defaults, options);

	this.api = api;
	this.tree = tree;
}

Executor.prototype.exec = function (optionsChain, data, options, callback) {
	// + слабая связанность
	// + легкость тестирования
	// - заморочки с динамическим обновлением дерева api
};

// or prepareArguments
Executor.prototype.prepareOptions = function () {

};

Executor.prototype.buildQueue = function () {

};

Executor.prototype.addExtendRule = function () {

};

Executor.prototype.smartExtend = function () {

};

// pushStage / unshiftStage

module.exports = Executor;