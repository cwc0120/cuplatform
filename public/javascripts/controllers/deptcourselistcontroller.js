'use strict';

// Module: DeptCourseList
// Purpose: 
// 	This module is used to show course list of a department in deptcourselist.html 
// 	(for user) and deptcourselistv.html (for visitor) using server data and 
// 	provide methods to manipulate the data
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.addCourseDialog: add a new course (admin is required)
// 	$scope.delete: delete a course (admin is required)

ctrl.controller('deptCourseListController', function($scope, $window, $location, $routeParams, $mdDialog, Dept, Course) {
	// Variables
	$scope.$location = $location;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}
	$scope.order = 'courseCode';
	$scope.limit = 10;
	$scope.page = 1;
	$scope.selected = [];
	var deptCode = $routeParams.id;

	// Initialization: 
	// send a request to server and once it's successful, 
	// department information and its course list is shown on the HTML page.
	// Otherwise, an error message is shown.
	Dept.getOne(deptCode).success(function(res) {
		$scope.success = true;
		$scope.dept = res;
		Course.get(deptCode).success(function(res1) {
			$scope.courses = res1;
		}).error(function(res1) {
			$scope.success = false;
			$scope.errorMessage = res1.error;
		});
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	//--------------------------------------------------------------------------
	// Name: $scope.back
	// Purpose: return to previous page if error occurs
	$scope.back = function() {
		window.history.back();
	};

	//--------------------------------------------------------------------------
	// Name: $scope.addCourseDialog
	// Purpose: add a new course (admin is required)
	// Input: department id, course id, course name, schedule (day, time and 
	// 	venue), instructor
	// Output: a course list containing course id and course name, department
	// 	information
	// Implementation:
	// 	First show a dialog with addcourse.html for user's input. Once received 
	// 	input, send the new course content to the server. The server will add 
	// 	the new course and send back the course list which is displayed on the 
	// 	webpage.
	$scope.addCourseDialog = function(event) {
		$mdDialog.show({
			controller: addCourseController,
			templateUrl: '/views/addcourse.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(newCourse) {
			Course.create(deptCode, newCourse).success(function(res) {
				$scope.courses = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of addcourse dialog
	function addCourseController($scope, $mdDialog, Course) {
		$scope.days = Course.days;
		$scope.times = Course.times;
		$scope.lessons = [];

		// quit ths dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// add a new lesson input
		$scope.addLesson = function() {
			var newlesson = {
				day: $scope.day,
				time: $scope.time,
				venue: $scope.venue
			};
			$scope.lessons.push(newlesson);
		};

		// delete a lesson input
		$scope.removeLesson = function(index) {
			$scope.lessons.splice(index, 1);
		};

		// confirm adding and close the dialog
		$scope.add = function() {
			$scope.newCourse.schedule = $scope.lessons;
			$mdDialog.hide($scope.newCourse);
		};
	}


	//--------------------------------------------------------------------------
	// Name: $scope.delete
	// Purpose: delete a course (admin is required)
	// Input: $scope.selected (a list of courseCode)
	// Output: a course list containing course id and course name, department
	// 	information
	// Implementation:
	// 	First send the request to the server. The server will delete course 
	// 	and send back the updated course list and dept infomation which is 
	// 	displayed on the webpage.
	$scope.delete = function() {
		async.each($scope.selected, deleteCourse, function(err) {
			if (err) {
				$scope.success = false;
				$scope.errorMessage = err;
			} else {
				$scope.selected = [];
				Course.get(deptCode).success(function(res) {
					$scope.courses = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		});
	};

	// a function that is called for each iteration to send a delete request
	// to the server
	function deleteCourse(e, cb) {
		Course.delete(e.courseCode).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});