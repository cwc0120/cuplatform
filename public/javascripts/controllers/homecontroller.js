'use strict';
ctrl.controller('homeController', function($scope, $location, $mdDialog, $mdToast, Auth, Socket, User) {
	$scope.user = {};
	$scope.disable = true;
	$scope.$location = $location;

	if (Auth.isLogged) {
		User.getTimetable(Auth.uid).success(function(res) {
			$scope.success = true;
			if (res !== null) {
				$scope.selected = res.coursesTaken;
				$scope.timetable = new Array(13);
				for (var k = 0; k < 13; k++) {
					$scope.timetable[k] = new Array(5);
					for (var h = 0; h < 5; h++) {
						$scope.timetable[k][h] = {};
					}
				}
				for (var i = 0; i < $scope.selected.length; i++) {
					for (var j = 0; j < $scope.selected[i].schedule.length; j++) {
						if ($scope.selected[i].schedule[j].day-1 < 5) {
							$scope.timetable[$scope.selected[i].schedule[j].time-1][$scope.selected[i].schedule[j].day-1].name = $scope.selected[i].courseCode;
						}	
					}
				}
			} else {
				$scope.selected = [];
				$scope.timetable = new Array(13);
				for (var k = 0; k < 13; k++) {
					$scope.timetable[k] = new Array(5);
					for (var h = 0; h < 5; h++) {
						$scope.timetable[k][h] = {};
					}
				}
			}
		}).error (function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	}

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
				User.getTimetable(Auth.uid).success(function(res) {
					$scope.success = true;
					if (res !== null) {
						$scope.selected = res.coursesTaken;
						$scope.timetable = new Array(13);
						for (var k = 0; k < 13; k++) {
							$scope.timetable[k] = new Array(5);
							for (var h = 0; h < 5; h++) {
								$scope.timetable[k][h] = {};
							}
						}
						for (var i = 0; i < $scope.selected.length; i++) {
							for (var j = 0; j < $scope.selected[i].schedule.length; j++) {
								if ($scope.selected[i].schedule[j].day-1 < 5) {
									$scope.timetable[$scope.selected[i].schedule[j].time-1][$scope.selected[i].schedule[j].day-1].name = $scope.selected[i].courseCode;
								}	
							}
						}
					} else {
						$scope.selected = [];
						$scope.timetable = new Array(13);
						for (var k = 0; k < 13; k++) {
							$scope.timetable[k] = new Array(5);
							for (var h = 0; h < 5; h++) {
								$scope.timetable[k][h] = {};
							}
						}
					}
				}).error (function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
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
				Socket.connect();
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
			var fd = new FormData();
			fd.append('img', $scope.img);
			fd.append('uid', $scope.newUser.uid);
			fd.append('email', $scope.newUser.email);
			fd.append('pwd1', $scope.newUser.pwd1);
			fd.append('pwd2', $scope.newUser.pwd2);
			Auth.register(fd).success(function(result) {
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