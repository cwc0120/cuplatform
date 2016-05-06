'use strict';

// Module: ThreadList
// Purpose: 
// 	This module is used to show thread list in threadlist.html using server data. 
// 	It also allows user/admin to edit thread, add/delete comment and report the
// 	thread
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.addThreadDialog: post a thread
// 	$scope.delete: delete a thread (admin is required)

ctrl.controller('threadListController', function($scope, $window, $location, $routeParams, $mdDialog, $mdToast, Thread) {
	// Variables
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
	
	// Initialization:
	// send a request to server and once it's successful, 
	// a thread list is shown on the HTML page. 
	// Otherwise, an error message is shown.
	Thread.get($scope.code).success(function(res) {
		$scope.success = true;
		$scope.threads = res;
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
	// Name: $scope.addThreadDialog
	// Purpose: post a thread
	// Input: [course id], annoymonus for secret mode, topic and content
	// Output: A list of thread objects containing topic, content, author, 
	// 	dateOfUpdate, annoymous
	// Implementation:
	// 	First show a dialog with addthread.html for user's input. Once received 
	// 	input, send the new thread to the server. The server will add 
	// 	the new thread and send back the thread list which is displayed 
	// 	on the webpage.
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

	// controller of addthread
	function addThreadController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm add and close the dialog
		$scope.addThread = function() {
			$scope.newThread.content = $scope.htmlVariable;
			$mdDialog.hide($scope.newThread);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.delete
	// Purpose: delete a thread (admin is required)
	// Input: $scope.selected (a list of thread id)
	// Output: An updated list of thread objects containing topic, content, author, 
	// 	dateOfUpdate, annoymous
	// Implementation:
	// 	First send the request to the server. The server will delete thread 
	// 	and send back the updated thread list which is displayed on the 
	// 	webpage.
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

	// a function that is called for each iteration to send a delete request
	// to the server
	function deleteThread(e, cb) {
		Thread.delete(e._id).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});