'use strict';
ctrl.controller('threadListController', function($scope, $window, $location, $routeParams, $mdDialog, $mdToast, Thread) {
	$scope.$location = $location;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	if ($routeParams.id === 'GENERAL') {
		$scope.code = 'General';
	} else {
		$scope.code = $routeParams.id;
	}

	$scope.order = 'topic';
	$scope.limit = 10;
	$scope.page = 1;
	$scope.selected = [];
	
	Thread.get($scope.code).success(function(res) {
		$scope.success = true;
		$scope.threads = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.addThreadDialog = function(event) {
		$mdDialog.show({
			controller: addThreadController,
			templateUrl: '/views/addthread.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(newThread) {
			Thread.create($scope.code, newThread).success(function(res) {
				$scope.threads = res;
				$mdToast.show($mdToast.simple().textContent('You earn 1 point.'));
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function addThreadController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.addThread = function() {
			$scope.newThread.content = $scope.htmlVariable;
			$mdDialog.hide($scope.newThread);
		};
	}

	$scope.delete = function() {
		async.each($scope.selected, deleteThread, function(err) {
			if (err) {
				$scope.success = false;
				$scope.errorMessage = err;
			} else {
				$scope.selected = [];
				Thread.get($scope.code).success(function(res){
					$scope.threads = res;
					$mdToast.show($mdToast.simple().textContent('1 point is deducted from the selected author(s).'));
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});	
			}
		});
	};

	function deleteThread(e, cb) {
		Thread.delete(e._id).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});