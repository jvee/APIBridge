Сценарии использования:

1. Самый простой, когда api состоит из одних get запросов, в формате JSON:

{
	name: 'Instagram',
	models: [{
		locations: [
			{ search: 'https://api.instagram.com/v1/locations/search' },
            { get: 'https://api.instagram.com/v1/locations/:id },
            { recent: 'https://api.instagram.com/v1/locations/:id/media/recent' }
		],
		users: [
			{ get: 'https://api.instagram.com/v1/user/:id' },
			{ selfFeed: 'https://api.instagram.com/v1/users/self/feed' }
		]
	}]
}

2. Базовый урл и формат ответов вынесен в глобальные настройки API:

{
	name: 'Instagram',
	options: {
		base: 'https://api.instagram.com/v1/',
		dataType: 'json'
	},
	models: [{
		locations: [
			{ search: 'locations/search' },
            { get: 'locations/:id },
            { recent: 'locations/:id/media/recent' }
		]
	}]
}