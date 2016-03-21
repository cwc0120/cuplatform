'use strict';
angular.module('CUPServices', [])	
	.factory('Auth', function($http, $window, $location) {
		var Auth = {};

		if ($window.localStorage['cupToken']) {
			Auth.isLogged = true;
			Auth.uid = $window.localStorage['uid'];
		} else {
			Auth.isLogged = false;
			Auth.uid = '';
		}
		
		Auth.register = function(req) {
			return $http.post('/api/register', req)
		};

		Auth.login = function(req) {
			return $http.post('/api/auth', req)
		};

		Auth.logout = function() {
			Auth.uid = '';
			Auth.isLogged = false;
			$window.localStorage.removeItem('uid');
			$window.localStorage.removeItem('admin');
			$window.localStorage.removeItem('cupToken');
			$location.path('/');
		};

		Auth.getToken = function() {
			return $window.localStorage['cupToken'];
		};

		Auth.setToken = function(req) {
			$window.localStorage['uid'] = req.uid;
			$window.localStorage['admin'] = req.admin;
			$window.localStorage['cupToken'] = req.token;
		};

		return Auth;
	})

	.factory('Dept', function($http) {
		return {
			get: function() {
				return $http.get('/api/dept');
			},
			getOne: function(id) {
				return $http.get('/api/dept/' + id);
			},
			create: function(data) {
				return $http.post('/api/dept', data);
			},
			edit: function(id, data) {
				return $http.put('/api/dept/' + id, data);
			},
			delete: function(id) {
				return $http.delete('/api/dept/' + id);
			}
		};
	})

	.factory('Course', function($http) {
		var Course = {};

		Course.days = [{
			index: 1,
			val: 'Mon'
		},
		{
			index: 2,
			val: 'Tue'
		},
		{
			index: 3,
			val: 'Wed'
		},
		{
			index: 4,
			val: 'Thu'
		},
		{
			index: 5,
			val: 'Fri'
		}];

		Course.times = [{
			index: 1,
			val: '08:30 - 09:15'
		},
		{
			index: 2,
			val: '09:30 - 10:15'
		},
		{
			index: 3,
			val: '10:30 - 11:15'
		},
		{
			index: 4,
			val: '11:30 - 12:15'
		},
		{
			index: 5,
			val: '12:30 - 13:15'
		},
		{
			index: 6,
			val: '13:30 - 14:15'
		},
		{
			index: 7,
			val: '14:30 - 15:15'
		},
		{
			index: 8,
			val: '15:30 - 16:15'
		},
		{
			index: 9,
			val: '16:30 - 17:15'
		},
		{
			index: 10,
			val: '17:30 - 18:15'
		},
		{
			index: 11,
			val: '18:30 - 19:15'
		},
		{
			index: 12,
			val: '19:30 - 20:15'
		},
		{
			index: 13,
			val: '20:30 - 21:15'
		}];

		Course.ratings = [{
			index: 1,
			val: '1 (Worst)'
		},
		{
			index: 2,
			val: '2'
		},
		{
			index: 3,
			val: '3'
		},
		{
			index: 4,
			val: '4'
		},
		{
			index: 5,
			val: '5 (Best)'
		}];

		Course.get = function(id) {
			return $http.get('/api/course/' + id);
		};
			
		Course.create = function(id, data) {
			return $http.post('/api/course/' + id, data);
		};

		Course.getOne = function(id) {
			return $http.get('/api/course/info/' + id);
		};

		Course.postInfo = function(id, data) {
			return $http.post('/api/course/info/' + id, data);
		};

		Course.edit = function(id, data) {
			return $http.put('/api/course/info/' + id, data);
		};

		Course.delete = function(id) {
			return $http.delete('/api/course/info/' + id);
		};

		Course.deleteInfo = function(id, cmid) {
			return $http.delete('/api/course/info/' + id + '/' + cmid);
		};

		return Course;
	})

	.factory('Resource', function($http) {
		return {
			get: function(id) {
				return $http.get('/api/resource/' + id);
			},
			getOne: function(id) {
				return $http.get('/api/resource/info/' + id);
			},
			getRes: function(id) {
				return $http.get('/api/resource/file/' + id);
			},
			create: function(id, data) {
				return $http.post('/api/resource/' + id, data, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				});
			},
			postComment: function(id, data) {
				return $http.post('/api/resource/info/' + id, data);
			},
			edit: function(id, data) {
				return $http.put('/api/resource/info/' + id, data);
			},
			delete: function(id) {
				return $http.delete('/api/resource/info/' + id);
			},
			deleteComment: function(id, cmid) {
				return $http.delete('/api/resource/info/' + id + '/' + cmid);
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