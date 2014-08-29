/**
 * Нормалайзер преобразует входное описание API в плоскую структуру.
 *
 *  - Никаких дополнительных действий api-normalizer не производит, например,
 *    дополнительных вычестлений тех или иных полей объектов.
 *
 *  - Нормалайзер должен уметь экспортировать результат своей работы в js-файл.
 *
 *  - Работает исключительно на сервере, поэтому допускается использовать любые
 *    модули.
 *
 * Условный пример такой структуры:
 *
 * {
 *		".": {
 *			"type": "root",
 *			"name": "Instagram",
 *			"baseURL": "https://api.instagram.com/v1/",
 *			"dataType": "json"
 *		},
 *		"locations": {
 *			"type": "model",
 *			"name": "locations"
 *		},
 *		"locations.seach": {
 *			"type": "endpoint",
 *			"name": "search",
 *			"url": "locations/search"
 *		}
 *	}
 *
 * Такое преобразование необходимо для:
 *  1. Быстрого поиска родителських/дочерних нод той или иной ноды API.
 *  2. Множественного способа передачи описания API.
 *  3. Динамической установки новых параметров нод
 *
 */

var nestedNodeTypes = ['models', 'endpoints'],
    normalizedAPI;

function _processNode(node, nodeType, parentName) {
  var x, z, nestedNode;

  nodePath = nodeType != 'root' ? parentName + '.' + node.name : '.';

  normalizedAPI[nodePath] = node;
  normalizedAPI[nodePath]['nodeType'] = nodeType;

  for (x = 0; x < nestedNodeTypes.length; x++) {
    nestedNode = node[nestedNodeTypes[x]]
    if (nestedNode) {
      delete node[nestedNodeTypes[x]];
      // также можно разруливать ситуацию, что у endpoints не может быть models
      // тут должна происходить проверка массив/объект у ноды
      for (z = 0; nestedNode.length; z++) {
          _processNode(nestedNode[z], nestedNodeTypes[x], node.name);
      }
    }
  }

}

function exec(APIDescription) {
  normalizedAPI = {};
  _procesNode(APIDescription, 'root');

  return normalizedAPI;
}

module.exports.exec = exec;
