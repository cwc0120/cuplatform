'use strict';

var cupRegister = angular.module('cupRegister', []);
	
cupRegister.factory('NewUser', ['$http', function($http) {
	return {
		create: function(data) {
			return $http.post('/api/register', data);
		}
	};
}]);
	
cupRegister.controller('mainController', ['$scope', '$http', '$window', 'NewUser', function($scope, $http, $window, NewUser) {
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