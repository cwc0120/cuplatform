'use strict';
ctrl.controller('ItemListController', function($scope, $window, $location, $routeParams, $route, Item) {
	$scope.$location = $location;
	$scope.$route = $route;
	$scope.adding = false;
	$scope.newItem = {};
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	$scope.sortType = 'date';
	$scope.sortReverse = false;
	$scope.searchDept = '';
	
	Item.get().success(function(res) {
		$scope.success = true;
		$scope.items = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.enableAdd = function() {
		if (!$scope.adding) {
			$scope.adding = true;
		}
	};

	$scope.addItem = function() {
		$scope.newItem.description = $scope.htmlVariable;
		if ($scope.newItem.name !== undefined && $scope.newItem.name !== '' && 
			$scope.newItem.price !== undefined && $scope.newItem.price !== '' &&
			$scope.newItem.description !== undefined && $scope.newItem.description !== '') {
			Item.create($scope.newItem).success(function(res) {
				$scope.adding = false;
				$scope.newItem = {};
				$scope.htmlVariable = '';
				$scope.items = res;
			}).error(function(res){
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}	
	};

	$scope.delete = function(id) {
		Item.delete(id).success(function(res) {
			$scope.items = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};
});