'use strict';
ctrl.controller('deptCourseListController', function($scope, $window, $location, $routeParams, $mdDialog, Dept, Course) {
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

	$scope.back = function() {
		window.history.back();
	};

	$scope.addDialog = function(event) {
		$mdDialog.show({
			controller: AddCourseController,
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

	function AddCourseController($scope, $mdDialog, Course) {
		$scope.days = Course.days;
		$scope.times = Course.times;
		$scope.lessons = [];
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.addLesson = function() {
			var newlesson = {
				day: $scope.day,
				time: $scope.time,
				venue: $scope.venue
			};
			$scope.lessons.push(newlesson);
		};

		$scope.removeLesson = function(index) {
			$scope.lessons.splice(index, 1);
		};

		$scope.add = function() {
			$scope.newCourse.schedule = $scope.lessons;
			$mdDialog.hide($scope.newCourse);
		};
	}

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

	function deleteCourse(e, cb) {
		Course.delete(e.courseCode).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});