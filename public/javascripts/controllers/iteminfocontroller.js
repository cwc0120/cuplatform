'use strict';
ctrl.controller('itemInfoController', function($scope, $window, $location, $routeParams, $mdDialog, Item, Socket, Auth) {
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

	function editItemController($scope, $mdDialog, item) {
		$scope.edit = item;
		$scope.htmlVariable = $scope.edit.description;

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.editItem = function() {
			$scope.edit.description = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

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

	function newMessageController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.send = function() {
			$mdDialog.hide($scope.message);
		};
	}

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

	$scope.interest = function() {
		Item.interest(itemID).success(function(res) {
			$scope.bought = true;
			$scope.item = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	$scope.uninterest = function() {
		Item.uninterest(itemID).success(function(res) {
			$scope.bought = false;
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