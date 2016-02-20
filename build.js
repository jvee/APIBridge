// TODO
// 1. Выработать правила для написания модулей, плагинов, бандлов,
// standalone-api и их последующей сборки
// 2. Можно отказаться от requirejs в пользу других утилит
// https://github.com/tobie/module-grapher
// https://github.com/tobie/modulr-node
// https://github.com/Magnetme/yoloader
// 3. Обязательно попробовать http://rollupjs.org/

var requirejs = require('requirejs');

var config = {
		baseUrl: __dirname + '/lib',
		name: 'rapier',
		paths: {
			'q': 'empty:',
			'extend': 'empty:',
			'control-najax': 'empty:'
		},
		out: './api.js',
		optimize: 'none',
		logLevel: 0,
		cjsTranslate: true,
		onBuildWrite: cleanSrc
	};

requirejs.optimize(config, function (buildResponse) {
	console.log(buildResponse);
});

function cleanSrc(name, path, content) {
  return content
						// убираем все require()
						// TODO: нужно все декларации переменных вынести в отдельный
						// "var", без запятных в конце
						.replace(/^.*require\(.*\).*$/mg, '')
						// Уюираем все обращения к неймспейсу H
						// TODO	нужно переосмыслить органицацию модуля хэлперов
						.replace(/^.*\bH\b.*$/mg, '')
						// Избавляемся от вхождений define(...)
						// Вставляется автоматически r.js
						// опция - cjsTranslate
            .replace(/define\(.*\{/, '')
						// Меняем module.exports на return, для единобразия,
						// что бы потом удалить вместе с закрывающими скобками блока define
						// TODO Важно, что бы module exports всегдф был последней строкой
            .replace(/module\.exports\s*=\s*/, 'return ')
						// Чистим модуль от return'а в никуда
						// TODO
						// 1. Проверить, что все модули возвращают задекларированный объект
						// 2. в return нужно парсить имя модуля
            .replace(/\s*return\s+[^\}]+(\}\s*?\);[^\w\}]*)$/, '\n$1')
						// Удаляем закрывающие скобки define
            .replace(/\}\);\s*$/, '')
						// На всякий случай чистим пустые строки в начале файла
						// TODO на этом месте можно добавлять разделить для модуля
						// что бы потом проще воспринимались склееные файлы
            .replace(/^\s*\n(\s*\w*)/, '$1');
}
