'use strict';
var cup = angular.module('CUP', ['ngRoute']);

cup.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '/views/home.html',
			controller: 'homeController'
		})

		.when('/register', {
			templateUrl: '/views/register.html',
			controller: 'registerController'
		})

		.when('/task', {
			templateUrl: '/views/task.html',
			controller: 'taskController'
		});
});

cup.factory('User', ['$http', function($http) {
	return {
		validate: function(data) {
			return $http.post('/api/auth', data);
		}
	};
}]);

cup.factory('NewUser', ['$http', function($http) {
	return {
		create: function(data) {
			return $http.post('/api/register', data);
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

cup.controller('homeController', ['$scope', '$http', '$window', 'User', function($scope, $http, $window, User) {
	$scope.user = {};

	$scope.submitUser = function() {
		if ($scope.user.uid !== undefined && $scope.user.pwd !== undefined) {
			User.validate($scope.user)
				.success(function(result) {
					$window.localStorage['cupToken'] = result.token;
					$window.location.href = result.redirect;
				})
				.error(function(err) {
					$scope.message = err.error;
				});
		}		
	};

	$scope.toRegister = function() {
		$window.location.href = '#register';
	};
}]);

cup.controller('registerController', ['$scope', '$http', '$window', 'NewUser', function($scope, $http, $window, NewUser) {
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
		NewUser.create($scope.newUser)
		.success(function(result) {
			$window.location.href = result.redirect;
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

cup.controller('taskController', ['$scope', '$http', 'Todos', function($scope, $http, Todos) {
	$scope.newTask = {};
	$scope.editTask = {};
	$scope.editing = false;

	Todos.get().success(function(data){
		$scope.todos = data;
	});

	$scope.create = function() {
		if ($scope.newTask.content === undefined) {
			return;
		}
		Todos.create($scope.newTask).success(function(data) {
			$scope.newTask = {};
			$scope.todos = data;
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
		});
	};

	$scope.delete = function(id) {
		Todos.delete(id).success(function(data) {
			$scope.todos = data;
		});
	};

	$scope.enableEdit = function(data) {
		if (!$scope.editing) {
			$scope.editing = true;
			return true;
		}
	};
}]);