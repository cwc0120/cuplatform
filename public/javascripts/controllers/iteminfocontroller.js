'use strict';

// Module: ItemInfo
// Purpose: 
// 	This module is used to show item information in iteminfo.html 
// 	using server data. It also allows user to edit/delete item, send a message 
// 	to seller, sell item, interest/uninterest item
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.editItemDialog: edit item content (seller is required)
// 	$scope.newMessageDialog: leave a message to seller (interested is required)
// 	$scope.sellDialog: sell the item (seller is required)
// 	$scope.interest: interest in the item (uninterested is required)
// 	$scope.uninterest: uninterest in the item (interested is required)
// 	$scope.delete: delete the item (seller or admin is required)

ctrl.controller('itemInfoController', function($scope, $window, $location, $routeParams, $mdDialog, Item, Socket, Auth) {
	// Variables
	$scope.$location = $location;
	$scope.bought = false;
	$scope.uid = $window.localStorage['uid'];
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}
	var itemID = $routeParams.id;

	// Initialization: 
	// send a request to server and once it's successful, the 
	// item content is shown on the HTML page. Otherwise, an error message is 
	// shown.
	Item.getOne(itemID).success(function(res) {
		$scope.success = true;
		$scope.item = res;
		for (var i = 0; i < $scope.item.buyer.length; i++) {
			if ($scope.item.buyer[i].uid === $scope.uid) {
				$scope.bought = true;
			}
		}
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
	// Name: $scope.editItemDialog
	// Purpose: edit item content (seller is required)
	// Input: item id, name, description, price, priceFlexible
	// Output: a updated item object
	// Implementation:
	// 	First show a dialog with edititem.html for user's input. Once received 
	// 	input, send the edit content to the server. The server will update the 
	// 	item content and send back the edited item content which is 
	// 	displayed on the webpage
	$scope.editItemDialog = function(event) {
		$mdDialog.show({
			controller: editItemController,
			templateUrl: '/views/edititem.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
			locals: {
				item: $scope.item
			}
		}).then(function(edit) {
			Item.edit(itemID, edit).success(function(res) {
				$scope.item = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of edititem dialog
	function editItemController($scope, $mdDialog, item) {
		$scope.edit = item;
		$scope.htmlVariable = $scope.edit.description;

		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm edit and close the dialog
		$scope.editItem = function() {
			$scope.edit.description = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.newMessageDialog
	// Purpose: leave a message to seller (interested is required)
	// Input: message
	// Output: none
	// Implementation:
	// 	First show a dialog with newmessage.html for user's input. Once received 
	// 	input, send the message to the seller by socket. The server will act 
	// 	according the socket.js in /routes/
	$scope.newMessageDialog = function(event, person) {
		$mdDialog.show({
			controller: newMessageController,
			templateUrl: '/views/newmessage.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
		}).then(function(result) {
			Socket.emit('auth', {token: Auth.getToken()});
			Socket.emit('sendNewMessage', {
				recipient: person,
				content: result
			});
		});
	};

	// controller of newmessage dialog
	function newMessageController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm send and close the dialog
		$scope.send = function() {
			$mdDialog.hide($scope.message);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.sellDialog
	// Purpose: sell the item (seller is required)
	// Input: buyer user id, item id
	// Output: an update item content
	// Implementation:
	// 	A dialog is shown for confirmation. If it is comfirmed, send a request
	// 	to the server to sell the item. If it is successful, an updated item
	// 	content is received and will be display on the webpage
	$scope.sellDialog = function(event, person) {
		var confirm = $mdDialog.confirm()
			.title('You will sell this item to ' + person + ".")
			.textContent('This action cannot be reverted.')
			.ariaLabel('Confirm')
			.targetEvent(event)
			.ok('Sell')
			.cancel('Cancel');
		$mdDialog.show(confirm).then(function() {
			Item.transact(itemID, person).success(function(res) {
				$scope.item = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.interest
	// Purpose: interest in the item (uninterested is required)
	// Input: item id
	// Output: an update item content
	// Implementation:
	// 	send a request to the server to interest in the item. If it is 
	// 	successful, an updated item content is received and will be display on 
	// 	the webpage
	$scope.interest = function() {
		Item.interest(itemID).success(function(res) {
			$scope.bought = true;
			$scope.item = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.uninterest
	// Purpose: uninterest in the item (interested is required)
	// Input: item id
	// Output: an update item content
	// Implementation:
	// 	send a request to the server to uninterest in the item. If it is 
	// 	successful, an updated item content is received and will be display on 
	// 	the webpage
	$scope.uninterest = function() {
		Item.uninterest(itemID).success(function(res) {
			$scope.bought = false;
			$scope.item = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.delete
	// Purpose: delete the item (seller or admin is required)
	// Input: item id
	// Output: none
	// Implementation:
	// 	First send the request to the server. The server will delete item 
	// 	and re-route to /item
	$scope.delete = function() {
		Item.delete(itemID).success(function(res) {
			$location.path("/item");
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};
});