'use strict';

// Module: Tradingrecord
// Purpose: 
// 	This module is used to show the trading history of the user
// Interface:
// 	$scope.back: return to previous page if error occurs

ctrl.controller('tradingRecordController', function($scope, $window, $location, User) {
	// Variables
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

	// Initialization:
	// send a request to server to retrieve items that was put on trading platform
	// if successful, display item list on the webpage
	User.getSellList().success(function(res) {
		$scope.success = true;
		$scope.selllist = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	// Initialization:
	// send a request to server to retrieve items that was interested/bought
	// if successful, display item list on the webpage
	User.getBuyList().success(function(res) {
		$scope.success = true;
		$scope.buylist = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	//--------------------------------------------------------------------------
	// Name: $scope.back
	// Purpose: return to previous page if error occurs
	$scope.back = function() {
		window.history.back();
	};
});