'use strict';
ctrl.controller('timetableController', function($scope, $window, $location, $routeParams, $mdToast, User, Course, Auth) {
	$scope.$location = $location;
	$scope.uid = $window.localStorage['uid'];

	$scope.visituid = $routeParams.uid;

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

	$scope.active = function(index) {
		if ($scope.visituid === $scope.uid) {
			for (var k = 0; k < $scope.courses[index].schedule.length; k++) {
				if ($scope.courses[index].schedule[k].day - 1 < 5) {
					$scope.timetable[$scope.courses[index].schedule[k].time-1][$scope.courses[index].schedule[k].day-1].active = true;
				}
			}	
		}
	};

	$scope.deactive = function() {
		if ($scope.visituid === $scope.uid) {
			for (var i = 0; i < $scope.timetable.length; i++) {
				for (var j = 0; j < $scope.timetable[i].length; j++) {
					$scope.timetable[i][j].active = false;
				}
			}
		}
	};

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