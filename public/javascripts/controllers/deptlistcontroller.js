'use strict';
ctrl.controller('deptListController', function($scope, $window, $location, $mdDialog, $mdMedia, $mdEditDialog, Dept) {
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

	Dept.get().success(function(res){
		$scope.success = true;
		$scope.depts = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.back = function() {
		window.history.back();
	};

	$scope.addDialog = function(event) {
		$mdDialog.show({
			controller: AddDeptController,
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

	function AddDeptController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.add = function() {
			$mdDialog.hide($scope.newDept);
		};
	}

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

	function deleteDept(e, cb) {
		Dept.delete(e.deptCode).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}
});