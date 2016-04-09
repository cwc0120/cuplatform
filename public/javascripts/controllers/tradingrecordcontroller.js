'use strict';
ctrl.controller('tradingRecordController', function($scope, $window, $location, User) {
	$scope.$location = $location;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	$scope.orderBuy = 'name';
	$scope.orderSell = 'name';
	$scope.limit = 10;
	$scope.page = 1;

	User.getSellList().success(function(res) {
		$scope.success = true;
		$scope.selllist = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	User.getBuyList().success(function(res) {
		$scope.success = true;
		$scope.buylist = res;
		console.log($scope.buylist);
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.back = function() {
		window.history.back();
	};
});