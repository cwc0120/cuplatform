'use strict';
ctrl.controller('courseInfoController', function($scope, $window, $location, $routeParams, $mdDialog, $mdToast, Course) {
	$scope.$location = $location;
	$scope.days = Course.days;
	$scope.times = Course.times;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	var courseCode = $routeParams.id;

	// Initialization
	Course.getOne(courseCode).success(function(res) {
		$scope.success = true;
		$scope.course = res;
		$scope.lessons = res.schedule;
		calculate();
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	// error return
	$scope.back = function() {
		window.history.back();
	};

	// Course basic module -----------------------------------------------
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
				$scope.course = res;
				$scope.lessons = res.schedule;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function editCourseController($scope, $mdDialog, Course, course) {
		$scope.days = Course.days;
		$scope.times = Course.times;
		$scope.edit = course;
		$scope.editLessons = course.schedule || [];

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.addLesson = function() {
			var newlesson = {
				day: $scope.day,
				time: $scope.time,
				venue: $scope.venue
			};
			$scope.editLessons.push(newlesson);
		};

		$scope.removeLesson = function(index) {
			$scope.editLessons.splice(index, 1);
		};

		$scope.editCourse = function() {
			$scope.edit.schedule = $scope.editLessons;
			$mdDialog.hide($scope.edit);
		};
	}

	// Course info module -----------------------------------------------
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

	function addCourseInfoController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.addCourseInfo= function() {
			$mdDialog.hide($scope.newInfo);
		};
	}

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
});