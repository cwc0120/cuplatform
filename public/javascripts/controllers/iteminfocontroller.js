'use strict';
ctrl.controller('ItemInfoController', function($scope, $window, $location, $routeParams, $route, Item) {
	$scope.$location = $location;
	$scope.$route = $route;
	$scope.editing = false;
	$scope.bought = false;
	$scope.edit = {};
	$scope.uid = $window.localStorage['uid'];
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	var itemID = $routeParams.id;

	Item.getOne(itemID).success(function(res) {
		$scope.success = true;
		$scope.item = res;
		for (var i = 0; i < $scope.item.buyers.length; i++) {
			if ($scope.item.buyers[i] === $scope.uid) {
				$scope.bought = true;
			}
		}
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.enableEdit = function() {
		if (!$scope.editing) {
			$scope.editing = true;
		}
	};

	$scope.editItem = function() {
		$scope.edit.description = $scope.htmlVariable;
		if ($scope.edit.name !== undefined && $scope.edit.name !== '' && 
			$scope.edit.price !== undefined && $scope.edit.price !== '' &&
			$scope.edit.description !== undefined && $scope.edit.description !== '') {
			Item.edit(itemID, $scope.edit).success(function(res) {
				$scope.editing = false;
				$scope.edit = {};
				$scope.htmlVariable = '';
				$scope.item = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}
		
	};

	$scope.buy = function() {
		Item.buy(itemID).success(function(res) {
			$scope.bought = true;
			$scope.item = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	$scope.transact = function() {
		Item.transact(itemID).success(function(res) {
			$scope.sold = true;
			$scope.item = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};
});