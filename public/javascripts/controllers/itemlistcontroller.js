'use strict';
ctrl.controller('itemListController', function($scope, $window, $location, $mdDialog, Item) {
	$scope.$location = $location;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	$scope.order = 'price';
	$scope.limit = 5;
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
		.then(function(fd) {
			Item.create(fd).success(function(res) {
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

		$scope.addItem = function() {
			var fd = new FormData();
			console.log($scope.code);
			$scope.description = $scope.htmlVariable;
			fd.append('name', $scope.name);
			fd.append('code', $scope.code);
			fd.append('img', $scope.img);
			fd.append('price', $scope.price);
			fd.append('priceFlexible', $scope.priceFlexible);
			fd.append('description', $scope.description);
			$mdDialog.hide(fd);
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