'use strict';
ctrl.controller('threadController', function($scope, $window, $location, $routeParams, $mdDialog, Thread) {
	$scope.$location = $location;
	$scope.uid = $window.localStorage['uid'];
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}

	var threadID = $routeParams.id;

	Thread.getOne(threadID).success(function(res) {
		$scope.success = true;
		$scope.thread = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.editThreadDialog = function(event) {
		$mdDialog.show({
			controller: editThreadController,
			templateUrl: '/views/editthread.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
			locals: {
				thread: $scope.thread
			}
		})
		.then(function(edit) {
			Thread.edit($scope.thread._id, edit).success(function(res) {
				$scope.thread = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function editThreadController($scope, $mdDialog, thread) {
		$scope.edit = thread;
		$scope.htmlVariable = $scope.edit.content;

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.editThread = function() {
			$scope.edit.content = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

	$scope.addComment = function() {
		if ($scope.newComment !== '') {
			Thread.postComment(threadID, {content: $scope.newComment}).success(function(res) {
				$scope.newComment = '';
				$scope.thread = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}
	};

	$scope.deleteComment = function(cmid) {
		Thread.deleteComment(threadID, cmid).success(function(res) {
			$scope.thread = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};
});