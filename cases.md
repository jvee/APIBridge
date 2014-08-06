Сценарии использования:

1. Самый простой, когда api состоит из одних get запросов, в формате JSON:

{
	name: 'Instagram',
	models: [{
				name: 'locations',
				endpoints: [{
								name: 'search',
								url: 'https://api.instagram.com/v1/locations/search'
							},{
								name: 'get',
								url: 'https://api.instagram.com/v1/locations/:id
							},{
								name: 'recent',
								url: 'https://api.instagram.com/v1/locations/:id/media/recent'
							}]
			},{
				name: 'users',
				endpoints: [{
								name: 'get',
								url: 'https://api.instagram.com/v1/user/:id'
							},{
								name: 'selfFeed',
								url: 'https://api.instagram.com/v1/users/self/feed'
							}]
			}]
}

2. Базовый урл и формат ответов вынесен в глобальные настройки API:

{
	name: 'Instagram',
	options: {
		baseURL: 'https://api.instagram.com/v1/',
		dataType: 'json'
	},
	models: [{
				name: 'locations',
				endpoints: [{
								name: 'search',
								url: 'locations/search'
							},{
								name: 'get',
								url: 'locations/:id
							},{
								name: 'recent',
								url: 'locations/:id/media/recent'
							}]
			}]
}