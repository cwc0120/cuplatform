'use strict';

// Module: Thread
// Purpose: 
// 	This module is used to show thread content in thread.html using server data. 
// 	It also allows user/admin the edit thread, add/delete comment and report the
// 	thread
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.editThreadDialog: edit thread (author is required)
// 	$scope.addComment: add a comment
// 	$scope.deleteComment: delete a comment (admin is required)
//  $scope.reportDialog: report a thread to admin

ctrl.controller('threadController', function($scope, $window, $location, $routeParams, $mdDialog, $mdToast, Thread) {
	// Variables
	$scope.$location = $location;
	$scope.uid = $window.localStorage['uid'];
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}
	var threadID = $routeParams.id;
	$scope.newComment = '';

	// Initialization:
	// send a request to server to find the thread
	// if successful, display thread content on the webpage
	Thread.getOne(threadID).success(function(res) {
		$scope.success = true;
		$scope.thread = res;
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
	// Name: $scope.editThreadDialog
	// Purpose: edit a thread (author is required)
	// Input: thread id, thread content
	// Output: A updated thread object
	// Implementation:
	// 	First show a dialog with editthread.html for user's input. Once received 
	// 	input, send a request to the server. The server will update thread
	// 	and send back the updated thread which is displayed on the webpage.
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

	// controller of editthread
	function editThreadController($scope, $mdDialog, thread) {
		$scope.edit = thread;
		$scope.htmlVariable = $scope.edit.content;

		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm edit and close the dialog
		$scope.editThread = function() {
			$scope.edit.content = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.addComment
	// Purpose: add a comment
	// Input: thread id, comment
	// Output: an updated thread object
	// Implementation:
	// 	Send the comment to the server. The server will push the new comment and 
	// 	send back the updated thread which is displayed on the webpage.
	// 	Then, a Toast is shown that 1 points is added.
	// 	empty the textfield
	$scope.addComment = function() {
		if ($scope.newComment.length >= 15) {
			Thread.postComment(threadID, {content: $scope.newComment}).success(function(res) {
				$scope.newComment = '';
				$scope.thread = res;
				$mdToast.show($mdToast.simple().textContent('You earn 1 point.'));
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}
	};

	//--------------------------------------------------------------------------
	// Name: $scope.deleteComment
	// Purpose: delete a comment (admin is required)
	// Input: comment id
	// Output: an updated thread object
	// Implementation:
	// 	Send a delete request to the server. The server will delete the comment 
	// 	and send back the updated thread which is displayed on the webpage.
	// 	Then, a Toast is shown that 1 points is deducted from the author the comment
	$scope.deleteComment = function(cmid) {
		Thread.deleteComment(threadID, cmid).success(function(res) {
			$scope.thread = res;
			$mdToast.show($mdToast.simple().textContent('1 point is deducted from the user.'));
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.reportDialog
	// Purpose: report a thread to admin
	// Input: report message
	// Output: a toast is poped up to inform user
	// Implementation:
	// 	First show a dialog with report.html for user's input. Once 
	// 	received input, send the report to the server. The server will push the 
	// 	report to admin's update center. Then, a Toast is poped up.
	$scope.reportDialog = function(event) {
		$mdDialog.show({
			controller: reportController,
			templateUrl: '/views/report.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(report) {
			console.log(report);
			Thread.report($scope.thread._id, report).success(function() {
				$mdToast.show($mdToast.simple().textContent('Reported to administrators.'));
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of report
	function reportController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm and close the dialog
		$scope.confirm = function() {
			$mdDialog.hide($scope.report);
		};
	}
});