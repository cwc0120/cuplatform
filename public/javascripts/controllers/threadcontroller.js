'use strict';
ctrl.controller('threadController', function($scope, $window, $location, $routeParams, $route, Thread) {
	$scope.$location = $location;
	$scope.$route = $route;
	$scope.editing = false;
	$scope.adding = false;
	$scope.editContent = '';
	$scope.newComment = '';
	$scope.uid = $window.localStorage['uid'];
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	var threadID = $routeParams.id;

	Thread.getOne(threadID).success(function(res) {
		$scope.success = true;
		$scope.thread = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.enableEdit = function() {
		if (!$scope.editing) {
			$scope.editing = true;
		}
	};

	$scope.editThread = function() {
		$scope.editContent = $scope.htmlVariable;
		if ($scope.editContent !== '') {
			Thread.edit(threadID, {content: $scope.editContent}).success(function(res) {
				$scope.editing = false;
				$scope.editContent = '';
				$scope.htmlVariable = '';
				$scope.thread = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}
		
	};

	$scope.enableAdd = function() {
		if (!$scope.adding) {
			$scope.adding = true;
		}
	};

	$scope.addComment = function() {
		if ($scope.newComment !== '') {
			Thread.postComment(threadID, {content: $scope.newComment}).success(function(res) {
				$scope.adding = false;
				$scope.newComment = '';
				$scope.thread = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}
	};

	$scope.deleteComment = function(cmid) {
		Thread.deleteComment(threadID, cmid).success(function(res) {
			$scope.thread = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};
});