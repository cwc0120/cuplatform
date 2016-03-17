'use strict';
angular.module('CUPServices', [])	
	.factory('Auth', function($http, $window, $location) {
		return {
			register: function(data) {
				return $http.post('/api/register', data);
			},
			login: function(data) {
				return $http.post('/api/auth', data);
			},
			logout: function() {
				$location.path('/');
				$window.localStorage.removeItem('uid');
				$window.localStorage.removeItem('admin');
				$window.localStorage.removeItem('cupToken');
			},
			getToken: function() {
				return $window.localStorage['cupToken'];
			},
			setToken: function(res) {
				$window.localStorage['uid'] = res.uid;
				$window.localStorage['admin'] = res.admin;
				$window.localStorage['cupToken'] = res.token;
			},
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