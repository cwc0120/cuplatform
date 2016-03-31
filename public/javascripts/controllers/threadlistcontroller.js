'use strict';
ctrl.controller('threadListController', function($scope, $window, $location, $routeParams, $route, Thread) {
	$scope.$location = $location;
	$scope.$route = $route;
	$scope.adding = false;
	$scope.newThread = {};
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	if ($routeParams.id === 'GENERAL') {
		$scope.code = 'General';
	} else {
		$scope.code = $routeParams.id;
	}
	
	Thread.get($scope.code).success(function(res) {
		$scope.success = true;
		$scope.threads = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.enableAdd = function() {
		if (!$scope.adding) {
			$scope.adding = true;
		}
	};

	$scope.addThread = function() {
		$scope.newThread.content = $scope.htmlVariable;
		if ($scope.newThread.topic !== undefined && $scope.newThread.topic !== '' && 
			$scope.newThread.content !== undefined && $scope.newThread.content !== '') {
			Thread.create($scope.code, $scope.newThread).success(function(res) {
				$scope.adding = false;
				$scope.newThread = {};
				$scope.htmlVariable = '';
				$scope.threads = res;
			}).error(function(res){
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}	
	};

	$scope.delete = function(id) {
		Thread.delete(id).success(function(res) {
			$scope.threads = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};
});