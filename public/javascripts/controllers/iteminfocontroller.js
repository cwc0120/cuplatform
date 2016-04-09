'use strict';
ctrl.controller('itemInfoController', function($scope, $window, $location, $routeParams, $mdDialog, Item) {
	$scope.$location = $location;
	$scope.bought = false;
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
		for (var i = 0; i < $scope.item.buyer.length; i++) {
			if ($scope.item.buyer[i] === $scope.uid) {
				$scope.bought = true;
			}
		}
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.editItemDialog = function(event) {
		$mdDialog.show({
			controller: editItemController,
			templateUrl: '/views/edititem.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
		}).then(function(edit) {
			Item.edit(itemID, edit).success(function(res) {
				$scope.item = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function editItemController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.editItem = function() {
			$scope.edit.description = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

	$scope.interest = function() {
		Item.buy(itemID).success(function(res) {
			$scope.bought = true;
			$scope.item = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	$scope.sell = function(buyer) {
		Item.transact(itemID, buyer).success(function(res) {
			$scope.sold = true;
			$scope.item = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	$scope.delete = function() {
		Item.delete(itemID).success(function(res) {
			$location.path("/item");
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};
});