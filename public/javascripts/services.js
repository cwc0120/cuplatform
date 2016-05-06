'use strict';
// This file encapulate server methods. Please check js files in /routes for
// implementation of server methods
angular.module('CUPServices', [])
	// authentication unit	
	.factory('Auth', function($http, $window, $location) {
		var Auth = {};

		if ($window.localStorage['cupToken']) {
			Auth.isLogged = true;
			Auth.uid = $window.localStorage['uid'];
		} else {
			Auth.isLogged = false;
			Auth.uid = '';
		}
		
		// registration
		Auth.register = function(req) {
			return $http.post('/api/register', req, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				});
		};

		// login
		Auth.login = function(req) {
			return $http.post('/api/auth', req);
		};

		// refresh token
		Auth.refresh = function() {
			return $http.put('/api/auth', {uid: $window.localStorage['uid']});
		};

		// logout
		Auth.logout = function() {
			Auth.uid = '';
			Auth.isLogged = false;
			$window.localStorage.removeItem('uid');
			$window.localStorage.removeItem('icon');
			$window.localStorage.removeItem('admin');
			$window.localStorage.removeItem('cupToken');
			$location.path('/');
		};

		// get token from localStorage of browser
		Auth.getToken = function() {
			return $window.localStorage['cupToken'];
		};

		// save token from server into localStorage of browser
		Auth.setToken = function(req) {
			$window.localStorage['uid'] = req.uid;
			$window.localStorage['icon'] = req.icon;
			$window.localStorage['admin'] = req.admin;
			$window.localStorage['cupToken'] = req.token;
		};

		return Auth;
	})

	// department unit
	.factory('Dept', function($http) {
		return {
			// get all the departments
			get: function() {
				return $http.get('/api/dept');
			},
			// create a department
			create: function(data) {
				return $http.post('/api/dept', data);
			},
			// get information of a department
			getOne: function(did) {
				return $http.get('/api/dept/' + did);
			},
			// edit information of a department
			edit: function(did, data) {
				return $http.put('/api/dept/' + did, data);
			},
			// delete a department
			delete: function(did) {
				return $http.delete('/api/dept/' + did);
			}
		};
	})

	// course unit
	.factory('Course', function($http) {
		var Course = {};

		// convert the format of timetable into a readable format
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
		},{
			index: 6,
			val: 'Sat'
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

		// get course list in a department
		Course.get = function(did) {
			return $http.get('/api/course/' + did);
		};
		
		// create a course	
		Course.create = function(did, data) {
			return $http.post('/api/course/' + did, data);
		};

		// get information of a course
		Course.getOne = function(cid) {
			return $http.get('/api/course/info/' + cid);
		};

		// add comment on a course
		Course.postInfo = function(cid, data) {
			return $http.post('/api/course/info/' + cid, data);
		};

		// edit information of a course
		Course.edit = function(cid, data) {
			return $http.put('/api/course/info/' + cid, data);
		};

		// delete a course
		Course.delete = function(cid) {
			return $http.delete('/api/course/info/' + cid);
		};

		// delete a course comment
		Course.deleteInfo = function(cid, cmid) {
			return $http.delete('/api/course/info/' + cid + '/' + cmid);
		};

		return Course;
	})

	// resource unit
	.factory('Resource', function($http) {
		return {
			// get resource list of a course
			get: function(cid) {
				return $http.get('/api/resource/' + cid);
			},

			// create a resource
			create: function(cid, data) {
				return $http.post('/api/resource/' + cid, data, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				});
			},

			// get information of a resource
			getOne: function(resid) {
				return $http.get('/api/resource/info/' + resid);
			},

			// download a resource
			getRes: function(resid) {
				return $http.get('/api/resource/file/' + resid, {responseType: 'blob'});
			},
			
			// add comment on a resource
			postComment: function(resid, data) {
				return $http.post('/api/resource/info/' + resid, data);
			},

			// edit a resource
			edit: function(resid, data) {
				return $http.put('/api/resource/info/' + resid, data);
			},

			// delete a resource
			delete: function(resid) {
				return $http.delete('/api/resource/info/' + resid);
			},

			// delete comment on a resource
			deleteComment: function(resid, cmid) {
				return $http.delete('/api/resource/info/' + resid + '/' + cmid);
			},

			// report a resource to admin
			report: function(resid, data) {
				return $http.post('/api/resource/report/' + resid, data);
			}
		};
	})

	// discussion (thread) unit
	.factory('Thread', function($http) {
		return {
			// get thread list of a course
			get: function(cid) {
				return $http.get('/api/thread/' + cid);
			},	

			// create a thread
			create: function(cid, data) {
				return $http.post('/api/thread/' + cid, data);
			},

			// get thread detail
			getOne: function(tid) {
				return $http.get('/api/thread/detail/' + tid);
			},

			// add comment on a thread
			postComment: function(tid, data) {
				return $http.post('/api/thread/detail/' + tid, data);
			},

			// edit a thread
			edit: function(tid, data) {
				return $http.put('/api/thread/detail/' + tid, data);
			},

			// delete a thread
			delete: function(tid) {
				return $http.delete('/api/thread/detail/' + tid);
			},

			// delete comment on a thread
			deleteComment: function(tid, cmid) {
				return $http.delete('/api/thread/detail/' + tid + '/' + cmid);
			},

			// report a thread to admin
			report: function(tid, data) {
				return $http.post('/api/thread/report/' + tid, data);
			}
		};
	})

	// trading platform (item) unit
	.factory('Item', function($http) {
		return {
			// get item list
			get: function() {
				return $http.get('/api/item');
			},

			// put an item on trading platform
			create: function(data) {
				return $http.post('/api/item', data, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				});
			},

			// get item detail
			getOne: function(itemid) {
				return $http.get('/api/item/' + itemid);
			},

			// edit an item
			edit: function(itemid, data) {
				return $http.put('/api/item/' + itemid, data);
			},

			// delete an item
			delete: function(itemid) {
				return $http.delete('/api/item/' + itemid);
			},

			// interest on an item
			interest: function(itemid) {
				return $http.post('/api/item/request/' + itemid);
			},

			// sell an item to a user
			transact: function(itemid, uid) {
				return $http.put('/api/item/request/' + itemid, {uid: uid});
			},

			// uninterest on an item
			uninterest: function(itemid) {
				return $http.delete('/api/item/request/' + itemid);
			}		
		};
	})

	// user profile unit
	.factory('User', function($http) {
		return {
			// get user's profile
			find: function(uid) {
				return $http.get('/api/user/profile/' + uid);
			},

			// edit user's profile
			editProfile: function(uid, data) {
				return $http.put('/api/user/profile/' + uid, data);
			},

			// upload icon
			uploadIcon: function(uid, data) {
				return $http.post('/api/user/icon/' + uid, data, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				});
			},

			// delete an update message from update centre
			deleteUpdate: function(updateid) {
				return $http.delete('/api/user/update/' + updateid);
			},

			// change password
			changePwd: function(uid, data) {
				return $http.put('/api/user/pwd/' + uid, data);
			},

			// get list of items that are put on trading platform
			getSellList: function() {
				return $http.get('/api/user/selllist');
			},

			// get list of items that are interested in / bought from trading platform
			getBuyList: function() {
				return $http.get('/api/user/buylist');
			},

			// get timetable of a user
			getTimetable: function(uid) {
				return $http.get('/api/user/timetable/' + uid);
			},

			// edit timetable
			editTimetable: function(uid, data) {
				return $http.put('/api/user/timetable/' + uid, data);
			}
		};
	})

	// messenger (socket) unit
	.factory('Socket', function(socketFactory) {
		// import from socketFactory
		return socketFactory();
	});