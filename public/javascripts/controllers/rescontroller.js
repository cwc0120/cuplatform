'use strict';

// Module: Res
// Purpose: 
// 	This module is used to show resource list and its content in 
// 	res.html using server data and allows user to add/edit/delete 
// 	resource, see resource content, add/delete comment on the resource,
// 	download resource file and report resource to admin.
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.addResDialog: add a new resource
// 	$scope.check: see the resource content
// 	$scope.delete: delete a resource (admin is required)
// 	$scope.editResDialog: edit a resource (uploader is required)
// 	$scope.download: download a resource file
// 	$scope.addComment: post a comment on the resource
// 	$scope.deleteComment: delete a comment on the resource (admin is required)
// 	$scope.reportDialog: report a resource to admin

ctrl.controller('resController', function($scope, $window, $location, $routeParams, $route, $mdDialog, $mdToast, Resource) {
	// Variables
	$scope.$location = $location;
	$scope.$route = $route;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}
	$scope.courseCode = $routeParams.id.toUpperCase();
	$scope.order = 'name';
	$scope.limit = 5;
	$scope.page = 1;
	$scope.selected = [];
	$scope.newComment = '';

	// Initialization
	// send a request to server to find all the resource under a course
	// if suucessful, display list of resources on the webpage
	Resource.get($scope.courseCode).success(function(res) {
		$scope.success = true;
		$scope.ress = res;
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
	// Name: $scope.addResDialog
	// Purpose: add a new resource
	// Input: course id, resource name, description, file
	// Output: a list of resource objects containing name, dateOfUpload, uploader
	// Implementation:
	// 	First show a dialog with addres.html for user's input. Once 
	// 	received input, send the input to the server. The server will add the 
	// 	new resource and send back the updated resource list which is 
	// 	displayed on the webpage. Then, a Toast is shown that 10 points is added.
	$scope.addResDialog = function(event) {
		$mdDialog.show({
			controller: addResController,
			templateUrl: '/views/addres.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(fd) {
			Resource.create($scope.courseCode, fd).success(function(res) {
				$scope.ress = res;
				$mdToast.show($mdToast.simple().textContent('You earn 10 points.'));
			}).error(function(res){
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of addres
	function addResController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm and close the dialog
		$scope.addResource = function() {
			var fd = new FormData();
			$scope.description = $scope.htmlVariable;
			fd.append('file', $scope.file);
			fd.append('name', $scope.name);
			fd.append('description', $scope.description);
			$mdDialog.hide(fd);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.check
	// Purpose: see the resource content
	// Input: resource id
	// Output: a resource object
	// 	Send a request to server. The server will return the resource content
	// 	If successful, display the content on the webpage
	$scope.check = function(id) {
		Resource.getOne(id).success(function(res) {
			$scope.success = true;
			$scope.resource = res;
			$scope.deleted = false;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.delete
	// Purpose: delete a resource (admin is required)
	// Input: $scope.selected (a list of resource id)
	// Output: A list of resource objects containing name, dateOfUpload, uploader
	// Implementation:
	// 	First send a request to the server. The server will delete resource
	// 	and send back the updated resource list which is displayed on the webpage.
	$scope.delete = function() {
		async.each($scope.selected, deleteRes, function(err) {
			if (err) {
				$scope.success = false;
				$scope.errorMessage = err;
			} else {
				$scope.selected = [];
				Resource.get($scope.courseCode).success(function(res) {
					$scope.ress = res;
					$scope.deleted = true;
					$mdToast.show($mdToast.simple().textContent('10 points are deducted from the selected uploader(s).'));
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		});
	};

	// a function that is called for each iteration to send a delete request
	// to the server
	function deleteRes(e, cb) {
		Resource.delete(e._id).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}

	//--------------------------------------------------------------------------
	// Name: $scope.editResDialog
	// Purpose: edit a resource (uploader is required)
	// Input: resource id, name and description
	// Output: A updated resource object
	// Implementation:
	// 	First show a dialog with editres.html for user's input. Once received 
	// 	input, send a request to the server. The server will update resource
	// 	and send back the updated resource which is displayed on the webpage.
	// 	Then, send a request again to retrieve updated resource list.
	$scope.editResDialog = function(event) {
		$mdDialog.show({
			controller: editResController,
			templateUrl: '/views/editres.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
			locals: {
				res: $scope.resource
			}
		})
		.then(function(edit) {
			Resource.edit($scope.resource._id, edit).success(function(res) {
				$scope.resource = res;
				Resource.get($scope.courseCode).success(function(res1) {
					$scope.ress = res1;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of editres
	function editResController($scope, $mdDialog, res) {
		$scope.edit = res;
		$scope.htmlVariable = $scope.edit.description;
		
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm and close dialog
		$scope.editResource = function() {
			$scope.edit.description = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.download
	// Purpose: download a resource file
	// Input: resource id
	// Output: resource file
	// Implementation:
	// 	Send a request to the server to retrieve the file. If successful, pop up 
	// 	a toast to inform user that 3 points are deducted.
	$scope.download = function() {
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		Resource.getRes($scope.resource._id).then(function (result) {
			var file = new Blob([result.data], {type: result.data.type});
			var fileURL = window.URL.createObjectURL(file);
			a.href = fileURL;
			a.download = $scope.resource.link;
			a.click();
			$mdToast.show($mdToast.simple().textContent('3 points are deducted.'));
		}, function (res) {
			$mdToast.show($mdToast.simple().textContent('Error occurred.'));
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.addComment
	// Purpose: post a comment on the resource
	// Input: resource id, comment
	// Output: an updated resource object
	// Implementation:
	// 	Send the comment to the server. The server will push the new comment and 
	// 	send back the updated resource which is displayed on the webpage.
	// 	Then, empty the textfield
	$scope.addComment = function() {
		if ($scope.newComment.length >= 15) {
			Resource.postComment($scope.resource._id, {content: $scope.newComment}).success(function(res) {
				$scope.newComment = '';
				$scope.resource = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}
	};

	//--------------------------------------------------------------------------
	// Name: $scope.deleteComment
	// Purpose: delete a comment on the resource (admin is required)
	// Input: resource id
	// Output: an updated resource object
	// Implementation:
	// 	Send a delete request to the server. The server will delete the comment and 
	// 	send back the updated resource which is displayed on the webpage.
	$scope.deleteComment = function(cmid) {
		Resource.deleteComment($scope.resource._id, cmid).success(function(res) {
			$scope.resource = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.reportDialog
	// Purpose: report a resource to admin
	// Input: report message
	// Output: a toast is poped up to inform user
	// Implementation:
	// 	First show a dialog with report.html for user's input. Once 
	// 	received input, send the report to the server. The server will push the 
	// 	report to admin's update center. Then, a Toast is poped up.
			controller: reportController,
			templateUrl: '/views/report.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(report) {
			Resource.report($scope.resource._id, report).success(function() {
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
