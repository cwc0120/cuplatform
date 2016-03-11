'use strict';
angular.module('CUPServices', [])
	.factory('Auth', function($window) {
		return {
			getToken: function() {
				return $window.localStorage['cupToken'];
			},
			setToken: function(res) {
				$window.localStorage['uid'] = res.uid;
				$window.localStorage['cupToken'] = res.token;
			},
			isLogged: function() {
				var token = this.getToken();
				if (token) {
					return true;
				}
				return false;
			}
		};
	})

	.factory('User', function($http, $window, $location, Auth) {
		return {
			register: function(data) {
				return $http.post('/api/register', data);
			},
			login: function(data) {
				return $http.post('/api/auth', data);
			},
			logout: function() {
				Auth.isLogged();
				$location.path('/');
				$window.localStorage.removeItem('uid');
				$window.localStorage.removeItem('cupToken');
			}
		};
	})

	.factory('TokenInterceptor', function($q, Auth) {
		return {
			request: function(config) {
				var token = Auth.getToken();
				if (token) {
					config.headers['x-access-token'] = token;
				}
				return config;
			},
			response: function(res) {
				return res || $q.when(res);
			}
		};
	})

	.factory('Todos', function($http) {
		return {
			get: function() {
				return $http.get('/api/todo');
			},
			create: function(data) {
				return $http.post('/api/todo', data);
			},
			edit: function(id, data) {
				return $http.put('/api/todo/' + id, data);
			},
			delete: function(id) {
				return $http.delete('/api/todo/' + id);
			}
		};
	});