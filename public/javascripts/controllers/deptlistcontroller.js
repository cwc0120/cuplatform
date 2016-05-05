'use strict';

// Module: DeptList
// Purpose: 
// 	This module is used to show department list in deptlist.html (for user) and 
// 	deptlistv.html (for visitor) using server data and provide methods to 
// 	manipulate the data
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.addDeptDialog: add a new department (admin is required)
// 	$scope.editDeptName: edit a department's name (admin is required)
// 	$scope.delete: delete a department (admin is required)

ctrl.controller('deptListController', function($scope, $window, $location, $mdDialog, $mdEditDialog, Dept) {
	// Vairables
	$scope.$location = $location;
	if ($window.localStorage['admin'] === 'true') {
		$scope.admin = true;
	} else {
		$scope.admin = false;
	}
	$scope.order = 'deptCode';
	$scope.limit = 10;
	$scope.page = 1;
	$scope.selected = [];

	// Initialization: send a request to server and once it's successful, 
	// a department list is shown on the HTML page. 
	// Otherwise, an error message is shown.
	Dept.get().success(function(res){
		$scope.success = true;
		$scope.depts = res;
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
	// Name: $scope.addDeptDialog
	// Purpose: add a new department (admin is required)
	// Input: department id, department name
	// Output: a department list containing department id and department name
	// Implementation:
	// 	First show a dialog with adddept.html for user's input. Once received 
	// 	input, send the new department content to the server. The server will add 
	// 	the new department and send back the department list which is displayed 
	// 	on the webpage.
	$scope.addDeptDialog = function(event) {
		$mdDialog.show({
			controller: addDeptController,
			templateUrl: '/views/adddept.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		})
		.then(function(newDept) {
			Dept.create(newDept).success(function(res) {
				$scope.depts = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of adddept dialog
	function addDeptController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm adding and close the dialog
		$scope.add = function() {
			$mdDialog.hide($scope.newDept);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.editDeptName
	// Purpose: edit a department's name (admin is required)
	// Input: department id, department name
	// Output: a department list containing department id and department name
	// Implementation:
	// 	First show a in-window dialog for user's input. Once received input, 
	// 	send the edit content to the server. The server will update the 
	// 	department name and send back the updated list which is displayed on 
	// 	the webpage
	$scope.editDeptName = function(event, dept) {
		if ($scope.admin) {
			event.stopPropagation();
			$mdEditDialog.large({
				title: 'Edit department name',
				modelValue: dept.deptName,
				save: function(input) {
					console.log(input.$modelValue);
					Dept.edit(dept.deptCode, {deptName: input.$modelValue}).success(function(res) {
						$scope.depts = res;
					}).error(function(res) {
						$scope.success = false;
						$scope.errorMessage = res.error;
					});
				},
				targetEvent: event,
				validators: {'required': true}
			});
		}
	};

	//--------------------------------------------------------------------------
	// Name: $scope.delete
	// Purpose: delete a department (admin is required)
	// Input: $scope.selected (a list of deptCode)
	// Output: a department list containing department id and department name
	// Implementation:
	// 	First send the request to the server. The server will delete department 
	// 	and send back the updated department list which is displayed on the 
	// 	webpage.
	$scope.delete = function() {
		async.each($scope.selected, deleteDept, function(err) {
			if (err) {
				$scope.success = false;
				$scope.errorMessage = err;
			} else {
				$scope.selected = [];
				Dept.get().success(function(res){
					$scope.depts = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});	
			}
		});
	};

	// a function that is called for each iteration to send a delete request
	// to the server
	function deleteDept(e, cb) {
		Dept.delete(e.deptCode).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});