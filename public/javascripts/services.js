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
			return $http.post('/api/register', req);
		};

		Auth.login = function(req) {
			return $http.post('/api/auth', req);
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
			create: function(data) {
				return $http.post('/api/dept', data);
			},
			getOne: function(did) {
				return $http.get('/api/dept/' + did);
			},
			edit: function(did, data) {
				return $http.put('/api/dept/' + did, data);
			},
			delete: function(did) {
				return $http.delete('/api/dept/' + did);
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

		Course.get = function(did) {
			return $http.get('/api/course/' + did);
		};
			
		Course.create = function(did, data) {
			return $http.post('/api/course/' + did, data);
		};

		Course.getOne = function(cid) {
			return $http.get('/api/course/info/' + cid);
		};

		Course.postInfo = function(cid, data) {
			return $http.post('/api/course/info/' + cid, data);
		};

		Course.edit = function(cid, data) {
			return $http.put('/api/course/info/' + cid, data);
		};

		Course.delete = function(cid) {
			return $http.delete('/api/course/info/' + cid);
		};

		Course.deleteInfo = function(cid, cmid) {
			return $http.delete('/api/course/info/' + cid + '/' + cmid);
		};

		return Course;
	})

	.factory('Resource', function($http) {
		return {
			get: function(cid) {
				return $http.get('/api/resource/' + cid);
			},
			create: function(cid, data) {
				return $http.post('/api/resource/' + cid, data, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				});
			},
			getOne: function(resid) {
				return $http.get('/api/resource/info/' + resid);
			},
			getRes: function(resid) {
				return $http.get('/api/resource/file/' + resid, {responseType: 'blob'});
			},
			
			postComment: function(resid, data) {
				return $http.post('/api/resource/info/' + resid, data);
			},
			edit: function(resid, data) {
				return $http.put('/api/resource/info/' + resid, data);
			},
			delete: function(resid) {
				return $http.delete('/api/resource/info/' + resid);
			},
			deleteComment: function(resid, cmid) {
				return $http.delete('/api/resource/info/' + resid + '/' + cmid);
			},
		};
	})

	.factory('Thread', function($http) {
		return {
			get: function(cid) {
				return $http.get('/api/thread/' + cid);
			},	
			create: function(cid, data) {
				return $http.post('/api/thread/' + cid, data);
			},
			getOne: function(tid) {
				return $http.get('/api/thread/detail/' + tid);
			},
			postComment: function(tid, data) {
				return $http.post('/api/thread/detail/' + tid, data);
			},
			edit: function(tid, data) {
				return $http.put('/api/thread/detail/' + tid, data);
			},
			delete: function(tid) {
				return $http.delete('/api/thread/detail/' + tid);
			},
			deleteComment: function(tid, cmid) {
				return $http.delete('/api/thread/detail/' + tid + '/' + cmid);
			}
		};
	})

	.factory('Item', function($http) {
		return {
			get: function() {
				return $http.get('/api/item');
			},
			create: function(data) {
				return $http.post('/api/item', data);
			},
			getOne: function(itemid) {
				return $http.get('/api/item/' + itemid);
			},
			edit: function(itemid, data) {
				return $http.put('/api/item/' + itemid, data);
			},
			delete: function(itemid) {
				return $http.delete('/api/item/' + itemid);
			},
			buy: function(itemid) {
				return $http.get('/api/item/buyrequest/' + itemid);
			},
			transact: function(itemid, uid) {
				return $http.get('api/item/transactrequest/' + itemid + '/' + uid);
			}
		};
	});