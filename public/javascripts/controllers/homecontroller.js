'use strict';

// Module: Home
// Purpose: 
// 	This module is used to provide login/register access on the homepage and
// 	show basic information if the user is logged in.
// Interface:
// 	$scope.login: user login (visitor is required)
// 	$scope.registerDialog: visitor register (visitor is required)
// 	$scope.deleteUpdate: delete an update in update center (login is required)

ctrl.controller('homeController', function($scope, $location, $mdDialog, $mdToast, Auth, Socket, User) {
	// Variables
	$scope.user = {};
	$scope.disable = true;
	$scope.$location = $location;

	// Initialization: 
	// if the user is logged in, send a request to server to
	// retrieve the timetable of the user. Then, decode the server data and 
	// display on the webpage
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

	// check the state of the user (logged-in or logged-out) to determine the
	// content on the website.
	// if the user is logged-in, a timetable and update center should be shown
	// otherwise, introduction of CUP and login box is shown
	$scope.$watch(function() {
		return Auth.isLogged;
	}, function(newVal, oldVal) {
		if(typeof newVal !== 'undefined') {
			$scope.isLogged = Auth.isLogged;
		}
	});

	// check the state of the user (logged-in or logged-out) to determine the
	// content on the website.
	// if the user is logged-in, a request is sent to server to retrieve
	// update messages of the user
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

	//--------------------------------------------------------------------------
	// Name: $scope.login
	// Purpose: user login (visitor is required)
	// Input: user id, password
	// Output: token, user id, admin
	// Implementation:
	// 	Send a login request to the server. If successful, set localStorage of
	// 	of the browser to store the token and other user information. Also,
	// 	connect the user to socket for messenger module. Finally, retrieve the 
	// 	timetable of the user from server and display it on the webpage.
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

	//--------------------------------------------------------------------------
	// Name: $scope.registerDialog
	// Purpose: ask visitor to register
	// Input: user id, email, password, password confirmation, icon
	// Output: a token if registration is successful
	// Implementation:
	// 	First show a dialog with register.html for visitor's input. Once 
	// 	received input, send the new user information to the server. The server 
	// 	add the new user and re-route the user to homepage.
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

	// controller of register dialog
	function registerController($scope, $mdDialog, Auth) {
		$scope.newUser = {};

		// quit this dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// append the input into a formdata, then send the formdata to the 
		// server and close the dialog
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

	//--------------------------------------------------------------------------
	// Name: $scope.deleteUpdate
	// Purpose: delete an update in update center (login is required)
	// Input: update id
	// Output: a updated update message list
	// Implementation:
	// 	Send a delete request to the server. The server will delete the update 
	// 	message and send back the updated update message list which is displayed 
	// 	on the webpage.
	$scope.deleteUpdate = function(updateID) {
		User.deleteUpdate(updateID).success(function(res) {
			$scope.updates = res.updates;
		}).error(function(res) {
			$mdToast.show($mdToast.simple().textContent('Error: ' + res.error));
		});
	};
});