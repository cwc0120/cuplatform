'use strict';
var cup = angular.module('CUP', ['ngRoute']);

cup.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '/views/home.html',
			controller: 'homeController',
			requiredLogin: false
		})

		.when('/register', {
			templateUrl: '/views/register.html',
			controller: 'registerController',
			requiredLogin: false
		})

		.when('/task', {
			templateUrl: '/views/task.html',
			controller: 'taskController',
			requiredLogin: true
		})
		.otherwise({
			redirectTo: '/'
		});
});

cup.config(function($httpProvider) {
	$httpProvider.interceptors.push('TokenInterceptor');
});

cup.run(function($rootScope, $location, $window, Auth) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
		if (nextRoute !== null && nextRoute.requiredLogin && !Auth.isLogged() && !Auth.getToken()) {
			$location.path('/');
			console.log('Please log in');
		}
		if (!nextRoute.requiredLogin && Auth.isLogged() && Auth.getToken()) {
			$location.path('/task');
			console.log('Magic');
		}
	});
});

cup.factory('Auth', ['$window', function($window) {
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
}]);

cup.factory('User', ['$http', '$window', '$location', 'Auth', function($http, $window, $location, Auth) {
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
}]);

cup.factory('TokenInterceptor', ['$q', 'Auth', function($q, Auth) {
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
}]);

cup.factory('Todos', ['$http', function($http) {
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
}]);

cup.controller('homeController', ['$scope', '$location', 'User', 'Auth', function($scope, $location, User, Auth) {
	$scope.user = {};

	$scope.login = function() {
		if ($scope.user.uid !== undefined && $scope.user.pwd !== undefined) {
			User.login($scope.user)
				.success(function(result) {
					Auth.setToken(result);
					Auth.isLogged();
					$location.path(result.redirect);
				})
				.error(function(err) {
					$scope.message = err.error;
				});
		}		
	};

	$scope.register = function() {
		$location.path('/register');
	};
}]);

cup.controller('registerController', ['$scope', '$location', 'User', function($scope, $location, User) {
	$scope.newUser = {};
	$scope.disable = true;

	var alphanum = new RegExp('^[a-zA-Z0-9]*$');
	var cuemail = new RegExp('@link.cuhk.edu.hk');
	var uidChecked = false;
	var emailChecked = false;
	var pwd1Checked = false;
	var pwd2Checked = false;

	$scope.checkUid = function() {
		if (!alphanum.test($scope.newUser.uid)) {
			$scope.uidStatus = 'User ID should be alphanumeric.';
			uidChecked = false;
			$scope.disable = setDisable();
		} else {
			$scope.uidStatus = '';
			uidChecked = true;
			$scope.disable = setDisable();
		}
	};

	$scope.checkEmail = function() {
		if (!cuemail.test($scope.newUser.email)) {
			$scope.emailStatus = 'CUHK email should be provided.';
			emailChecked = false;
			$scope.disable = setDisable();
		} else {
			$scope.emailStatus = '';
			emailChecked = true;
			$scope.disable = setDisable();
		}
	};

	$scope.checkPwd1 = function() {
		if (!alphanum.test($scope.newUser.pwd1)) {
			$scope.pwd1Status = 'Password should be alphanumeric.';
			pwd1Checked = false;
			$scope.disable = setDisable;
		} else if ($scope.newUser.pwd1.length < 8) {
			$scope.pwd1Status = 'Password should be longer than 7 characters';
			pwd1Checked = false;
			$scope.disable = setDisable();
		} else {
			$scope.pwd1Status = '';
			pwd1Checked = true;
			$scope.disable = setDisable();
		}
	};

	$scope.checkPwd2 = function() {
		if ($scope.newUser.pwd1 !== $scope.newUser.pwd2) {
			$scope.pwd2Status = 'Password not matched';
			pwd2Checked = false;
			$scope.disable = setDisable();
		} else {
			$scope.pwd2Status = '';
			pwd2Checked = true;
			$scope.disable = setDisable();
		}
	};

	$scope.createUser = function() {
		User.register($scope.newUser)
		.success(function(result) {
			$location.path(result.redirect);
		})
		.error(function(err) {
			$scope.message = err.error;
		});
	};

	function setDisable() {
		if (uidChecked && emailChecked && pwd1Checked && pwd2Checked) {
			return false;
		} else {
			return true;
		}
	}
}]);

cup.controller('taskController', ['$scope', '$window', '$location', 'Todos', 'User', function($scope, $window, $location, Todos, User) {
	$scope.newTask = {};
	$scope.editTask = {};
	$scope.editing = false;
	$scope.uid = $window.localStorage['uid'];

	Todos.get().success(function(data){
		$scope.success = true;
		$scope.todos = data;
	}).error(function(data) {
		$scope.success = false;
		$scope.errorMessage = data.message;
	});

	$scope.create = function() {
		if ($scope.newTask.content === undefined) {
			return;
		}
		Todos.create($scope.newTask).success(function(data) {
			$scope.newTask = {};
			$scope.todos = data;
		}).error(function(data) {
			$scope.success = false;
			$scope.errorMessage = data.message;
		});
	};

	$scope.edit = function(id) {
		$scope.editing = false;
		if ($scope.editTask.content === undefined) {
			return false;
		}
		Todos.edit(id, $scope.editTask).success(function(data) {
			$scope.editTask = {};
			$scope.todos = data;
			return false;
		}).error(function(data) {
			$scope.success = false;
			$scope.errorMessage = data.message;
		});
	};

	$scope.delete = function(id) {
		Todos.delete(id).success(function(data) {
			$scope.todos = data;
		}).error(function(data) {
			$scope.success = false;
			$scope.errorMessage = data.message;
		});
	};

	$scope.enableEdit = function(data) {
		if (!$scope.editing && data.user == $scope.uid) {
			$scope.editing = true;
			return true;
		}
	};

	$scope.logout = function() {
		User.logout();
	};
}]);