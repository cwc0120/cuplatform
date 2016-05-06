'use strict';

// Module: CourseInfo
// Purpose: 
// 	This module is used to show course content in courseinfo.html (for user) and 
// 	courseinfov.html (for visitor) using server data. It also allows user/admin
// 	to edit course, add/delete course comment
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.editCourseDialog: edit course information (admin is required)
// 	$scope.addInfoDialog: add a course comment
// 	$scope.deleteInfo: delete a course comment (admin is required)
// 	$scope.registerDialog: ask visitor to register
// 	$scope.invalid: prompt user that he is not authorized to access further content 

ctrl.controller('courseInfoController', function($scope, $window, $location, $routeParams, $mdDialog, $mdToast, Course) {
	// Variables
	$scope.$location = $location;
	$scope.days = Course.days;
	$scope.times = Course.times;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}
	var courseCode = $routeParams.id;

	// Initialization: 
	// send a request to server and once it's successful, the 
	// content is shown on the HTML page and average rating will be computed.
	// Otherwise, an error message is shown.
	Course.getOne(courseCode).success(function(res) {
		$scope.success = true;
		$scope.course = res.course;
		$scope.visitor = res.visitor;
		$scope.lessons = res.course.schedule;
		calculate();
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
	// Name: $scope.editCourseDialog
	// Purpose: edit course information (admin is required)
	// Input: course id, course name, instructor, schedule (day, time and venue)
	// Output: a updated course object
	// Implementation:
	// 	First show a dialog with editcourse.html for user's input. Once received 
	// 	input, send the edit content to the server. The server will update the 
	// 	course information and send back the edited course information which is 
	// 	displayed on the webpage
	$scope.editCourseDialog = function(event) {
		$mdDialog.show({
			controller: editCourseController,
			templateUrl: '/views/editcourse.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
			locals: {
				course: $scope.course
			}
		})
		.then(function(edit) {
			Course.edit(courseCode, edit).success(function(res) {
				$scope.course = res.course;
				$scope.lessons = res.schedule;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of editcourse dialog
	function editCourseController($scope, $mdDialog, Course, course) {
		$scope.days = Course.days;
		$scope.times = Course.times;
		$scope.edit = course;
		$scope.editLessons = course.schedule || [];

		// quit this dialog
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
			$scope.editLessons.push(newlesson);
		};

		// delete a lesson input
		$scope.removeLesson = function(index) {
			$scope.editLessons.splice(index, 1);
		};

		// confirm edit and close the dialog
		$scope.editCourse = function() {
			$scope.edit.schedule = $scope.editLessons;
			$mdDialog.hide($scope.edit);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.addInfoDialog
	// Purpose: add a course comment
	// Input: course id, rating, outline, assessMethod, comment
	// Output: a updated course object
	// Implementation:
	// 	First show a dialog with addcourseinfo.html for user's input. Once 
	// 	received input, send the comment to the server. The server will push
	// 	the new comment and send back the updated course information which is 
	// 	displayed on the webpage. Then, average rating is computed and a Toast
	// 	is shown that 5 points is added.
	$scope.addInfoDialog = function(event) {
		$mdDialog.show({
			controller: addCourseInfoController,
			templateUrl: '/views/addcourseinfo.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
		})
		.then(function(newInfo) {
			Course.postInfo(courseCode, newInfo).success(function(res) {
				$scope.posted = true;
				$scope.course = res;
				calculate();
				$mdToast.show($mdToast.simple().textContent('You earn 5 points.'));
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of addcourseinfo dialog
	function addCourseInfoController($scope, $mdDialog) {
		// quit this dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm adding and close the dialog
		$scope.addCourseInfo= function() {
			$mdDialog.hide($scope.newInfo);
		};
	}


	//--------------------------------------------------------------------------
	// Name: $scope.deleteInfo
	// Purpose: delete a course comment (admin is required)
	// Input: course id, comment id
	// Output: a updated course object
	// Implementation:
	// 	First send the request to the server. The server will delete comment 
	// 	and send back the updated course information which is displayed on the 
	// 	webpage. Then, average rating is computed and a Toast is shown that 
	// 	5 points is deleted from the author of the comment.
	$scope.deleteInfo = function(cmid) {
		Course.deleteInfo(courseCode, cmid).success(function(res) {
			$scope.course = res;
			calculate();
			$mdToast.show($mdToast.simple().textContent('5 points are deducted from the author.'));
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.registerDialog
	// Purpose: ask visitor to register
	// Input: user id, email, password, password confirmation
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

		// send the user information to the server for registration
		$scope.createUser = function() {
			Auth.register($scope.newUser).success(function(result) {
				$mdDialog.hide($scope.newUser);
			}).error(function(err) {
				$scope.registerMessage = err.error;
			});
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.invalid
	// Purpose: prompt user that he is not authorized to access further content 
	// Input: no input
	// Output: no output
	$scope.invalid = function() {
		$mdToast.show($mdToast.simple().textContent('You are not taking this course. Please add this course to your timetable to access this page.'));
	}

	//--------------------------------------------------------------------------
	// Inner component

	// Name: calculate
	// Input: no input
	// Output: 
	// 	posted: true if the user has posted a comment
	// 	avgRating: average rating of the course
	// Implementation:
	// 	It computes the average ratings from all the course comment and check if
	// 	the user has posted a comement
	function calculate() {
		$scope.avgRating = 0;
		for (var i=0; i<$scope.course.info.length; i++) {
			$scope.avgRating += $scope.course.info[i].rating;
			if ($scope.course.info[i].author === $window.localStorage['uid']) {
				$scope.posted = true;
			}
		}
		if ($scope.course.info.length !== 0) {
			$scope.avgRating /= $scope.course.info.length;
			$scope.avgRating = Math.round($scope.avgRating * 100) / 100;
		}
	}
});