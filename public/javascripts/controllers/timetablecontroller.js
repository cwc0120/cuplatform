'use strict';

// Module: Timetable
// Purpose: 
// 	This module is used to show timetable in timetable.html using server data. 
// 	It also allows user to edit thread, add/delete comment and report the
// 	thread
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.search: search courses under a department
// 	$scope.pop: remove course from timetable
// 	$scope.active: highlight the course on the timetable
// 	$scope.deactive: de-highlight the course on the timetable
// 	$scope.push: add course to timetable
// 	$scope.submit: submit the timetable to server

ctrl.controller('timetableController', function($scope, $window, $location, $routeParams, $mdToast, User, Course, Auth) {
	$scope.$location = $location;
	$scope.uid = $window.localStorage['uid'];

	$scope.visituid = $routeParams.uid;

	//--------------------------------------------------------------------------
	// Name: $scope.back
	// Purpose: return to previous page if error occurs
	$scope.back = function() {
		window.history.back();
	};

	// Initialization:
	// Send a request to server tto retrieve the timetable of the user.
	// Then, put the course name to the corresponding cell of the timetable
	User.getTimetable($scope.visituid).success(function(res) {
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

	//--------------------------------------------------------------------------
	// Name: $scope.search
	// Purpose: search courses under a department
	// Input: department id
	// Output: courses list of the department
	// Implementation:
	// 	send a request to the server to retrieve course list of the department
	// 	if successful, display course list on the webpage
	$scope.search = function() {
		if ($scope.visituid === $scope.uid) {
			Course.get($scope.deptCode).success(function(res) {
				$scope.success = true;
				$scope.courses = res
			}).error(function(res) {
				$mdToast.show($mdToast.simple().textContent('Error: ' + res.error));
			});
		}
	}

	//--------------------------------------------------------------------------
	// Name: $scope.pop
	// Purpose: remove course from timetable
	// Input: index of the course
	// Output: an updated timetable
	// Implementation:
	// 	empty the cells occupied by the course
	// 	delete the course from the selected courses list
	// 	then, build timetable again using the selected courses list
	$scope.pop = function(index) {
		if ($scope.visituid === $scope.uid) {
			for (var j = 0; j < $scope.selected[index].schedule.length; j++) {
				if ($scope.selected[index].schedule[j].day-1 < 5) {
					$scope.timetable[$scope.selected[index].schedule[j].time-1][$scope.selected[index].schedule[j].day-1].name = '';
				}
			}
			$scope.selected.splice(index, 1);
			for (var i = 0; i < $scope.selected.length; i++) {
				for (var j = 0; j < $scope.selected[i].schedule.length; j++) {
					if ($scope.selected[i].schedule[j].day-1 < 5) {
						$scope.timetable[$scope.selected[i].schedule[j].time-1][$scope.selected[i].schedule[j].day-1].name = $scope.selected[i].courseCode;
					}	
				}
			}
		}
	};

	//--------------------------------------------------------------------------
	// Name: $scope.active
	// Purpose: highlight the course on the timetable
	// Input: index of the course
	// Output: an updated timetable with the course highlighted
	// Implementation:
	// 	mark the cells active to change style
	$scope.active = function(index) {
		if ($scope.visituid === $scope.uid) {
			for (var k = 0; k < $scope.courses[index].schedule.length; k++) {
				if ($scope.courses[index].schedule[k].day - 1 < 5) {
					$scope.timetable[$scope.courses[index].schedule[k].time-1][$scope.courses[index].schedule[k].day-1].active = true;
				}
			}	
		}
	};

	//--------------------------------------------------------------------------
	// Name: $scope.deactive
	// Purpose: de-highlight the course on the timetable
	// Input: index of the course
	// Output: an updated timetable with the course de-highlighted
	// Implementation:
	// 	mark the cells inactive to change style
	$scope.deactive = function() {
		if ($scope.visituid === $scope.uid) {
			for (var i = 0; i < $scope.timetable.length; i++) {
				for (var j = 0; j < $scope.timetable[i].length; j++) {
					$scope.timetable[i][j].active = false;
				}
			}
		}
	};

	//--------------------------------------------------------------------------
	// Name: $scope.push
	// Purpose: add course to timetable
	// Input: index of the course
	// Output: an updated timetable
	// Implementation:
	// 	push the course to the selected courses list
	// 	then, build timetable again using the selected courses list
	$scope.push = function(index) {
		if ($scope.visituid === $scope.uid) {
			var pushable = true;
			for (var i = 0; i < $scope.selected.length; i++) {
				if ($scope.courses[index].courseCode === $scope.selected[i].courseCode) {
					pushable = false;
					break;
				}
			}
			if (pushable) {
				for (var j = 0; j < $scope.courses[index].schedule.length; j++) {
					if ($scope.courses[index].schedule[j].day-1 < 5) {
						$scope.timetable[$scope.courses[index].schedule[j].time-1][$scope.courses[index].schedule[j].day-1].name = $scope.courses[index].courseCode;
					}
				}
				$scope.selected.push($scope.courses[index]);
			} else {
				$mdToast.show($mdToast.simple().textContent('You have added this course already.'));
			}
		}
	};

	//--------------------------------------------------------------------------
	// Name: $scope.submit
	// Purpose: submit the timetable to server
	// Input: user's timetable in array format
	// Output: a toast is poped up to inform user
	// Implementation:
	// 	convert the timetable to array format
	// 	build timetable again using the selected courses list
	// 	refresh the token again
	// 	if successful, a toast is poped up
	$scope.submit = function() {
		if ($scope.visituid === $scope.uid) {
			var timetable = [];
			for (var i = 0; i < $scope.selected.length; i++) {
				timetable.push($scope.selected[i]._id);
			}
			User.editTimetable($scope.uid, {timetable: timetable}).success(function(res) {
				$scope.success = true;
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
				Auth.refresh().success(function(res) {
					Auth.setToken(res);
					$mdToast.show($mdToast.simple().textContent('Your timetable is changed successfully.'));
				}).error(function(res) {
					$mdToast.show($mdToast.simple().textContent('Error: Update failed. Please re-login'));
				});
			}).error(function(res) {
				$mdToast.show($mdToast.simple().textContent('Error: ' + res.error));
			});
		}
	}
});