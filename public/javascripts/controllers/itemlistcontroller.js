'use strict';

// Module: ItemList
// Purpose: 
// 	This module is used to show list of items in itemlist.html 
// 	using server data and provide methods to manipulate the data
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.addItemDialog: put an item on the trading platform
// 	$scope.delete: delete items (admin is required)

ctrl.controller('itemListController', function($scope, $window, $location, $mdDialog, Item) {
	// Variables
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
	
	// Initialization: 
	// send a request to server and once it's successful, a 
	// list of items is shown on the HTML page. Otherwise, an error message is 
	// shown.
	Item.get().success(function(res) {
		$scope.success = true;
		$scope.items = res;
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

	//--------------------------------------------------------------------------
	// Name: $scope.addItemDialog
	// Purpose: put an item on the trading platform
	// Input: [course id], item name, description, image of item, price, 
	// 	flexible price (boolean)
	// Output: a list of item containing department id, course id, name, price
	// 	flexible price, date, seller user id, and link of image
	// Implementation:
	// 	First show a dialog with additem.html for user's input. Once received 
	// 	input, send the new item content to the server. The server will add 
	// 	the new item and send back the item list which is displayed 
	// 	on the webpage.
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

	// controller of additem
	function addItemController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// append the input into a formdata, then send the formdata to the 
		// server and close the dialog
		$scope.addItem = function() {
			var fd = new FormData();
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

	//--------------------------------------------------------------------------
	// Name: $scope.delete
	// Purpose: delete an item (admin is required)
	// Input: $scope.selected (a list of item id)
	// Output: a list of item containing department id, course id, name, price
	// 	flexible price, date, seller user id, and link of image
	// Implementation:
	// 	First send a request to the server. The server will delete item 
	// 	and send back the updated item list which is displayed on the 
	// 	webpage.
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

	// a function that is called for each iteration to send a delete request
	// to the server
	function deleteItem(e, cb) {
		Item.delete(e._id).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});