'use strict';
ctrl.controller('itemListController', function($scope, $window, $location, $mdDialog, Item) {
	$scope.$location = $location;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	$scope.order = 'price';
	$scope.limit = 10;
	$scope.page = 1;
	$scope.selected = [];
	
	Item.get().success(function(res) {
		$scope.success = true;
		$scope.items = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.back = function() {
		window.history.back();
	};

	$scope.addItemDialog = function(event) {
		$mdDialog.show({
			controller: addItemController,
			templateUrl: '/views/additem.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(newItem) {
			Item.create(newItem).success(function(res) {
				$scope.items = res;
			}).error(function(res){
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function addItemController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.add = function() {
			$scope.newItem.description = $scope.htmlVariable;
			$mdDialog.hide($scope.newItem);
		};
	}

	$scope.delete = function() {
		async.each($scope.selected, deleteItem, function(err) {
			if (err) {
				$scope.success = false;
				$scope.errorrMessage = err;
			} else {
				$scope.selected = [];
				Item.get().success(function(res) {
					$scope.items = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		});
	};

	function deleteItem(e, cb) {
		Item.delete(e._id).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});