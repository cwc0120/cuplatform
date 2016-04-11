'use strict';
ctrl.controller('homeController', function($scope, $location, $mdDialog, $mdToast, Auth, Socket, User) {
	$scope.user = {};
	$scope.disable = true;
	$scope.$location = $location;

	$scope.$watch(function() {
		return Auth.isLogged;
	}, function(newVal, oldVal) {
		if(typeof newVal !== 'undefined') {
			$scope.isLogged = Auth.isLogged;
		}
	});

	$scope.$watch(function() {
		return Auth.uid;
	}, function(newVal, oldVal) {
		if(typeof newVal !== 'undefined') {
			$scope.uid = Auth.uid;
			User.find($scope.uid).success(function(user) {
				$scope.updates = user.updates.reverse();
			});
		}
	});

	$scope.login = function() {
		if ($scope.user.uid !== undefined && $scope.user.pwd !== undefined) {
			Auth.login($scope.user).success(function(res) {
				$scope.user = {};
				$scope.loginMessage = '';
				Auth.uid = res.uid;
				Auth.isLogged = true;	
				Auth.setToken(res);
				$location.path('/');
				Socket.connect();
			}).error(function(err) {
				$scope.loginMessage = err.error;
			});
		}
	};

	$scope.registerDialog = function(event) {
		$mdDialog.show({
			controller: registerController,
			templateUrl: '/views/register.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(newUser) {
			Auth.login({uid: newUser.uid, pwd: newUser.pwd1}).success(function(res) {
				Auth.uid = res.uid;
				Auth.isLogged = true;
				Auth.setToken(res);
				$location.path('/');
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function registerController($scope, $mdDialog, Auth) {
		$scope.newUser = {};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.createUser = function() {
			Auth.register($scope.newUser).success(function(result) {
				$mdDialog.hide($scope.newUser);
			}).error(function(err) {
				$scope.registerMessage = err.error;
			});
		};
	}

	$scope.deleteUpdate = function(updateID) {
		User.deleteUpdate(updateID).success(function(res) {
			$scope.updates = res.updates;
		}).error(function(res) {
			$mdToast.show($mdToast.simple().textContent('Error: ' + res.error));
		});
	};
});