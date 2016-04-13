'use strict';
ctrl.controller('resController', function($scope, $window, $location, $routeParams, $route, $mdDialog, $mdToast, Resource) {
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

	Resource.get($scope.courseCode).success(function(res) {
		$scope.success = true;
		$scope.ress = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.back = function() {
		window.history.back();
	};

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

	function addResController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.addResource = function() {
			var fd = new FormData();
			$scope.description = $scope.htmlVariable;
			fd.append('file', $scope.file);
			fd.append('name', $scope.name);
			fd.append('description', $scope.description);
			$mdDialog.hide(fd);
		};
	}

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

	function deleteRes(e, cb) {
		Resource.delete(e._id).success(function(res) {
			cb();
		}).error(function(res) {
			cb(res.error);
		});
	}

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

	function editResController($scope, $mdDialog, res) {
		$scope.edit = res;
		$scope.htmlVariable = $scope.edit.description;
		
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.editResource = function() {
			$scope.edit.description = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

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

	$scope.addComment = function() {
		if ($scope.newComment !== '') {
			Resource.postComment($scope.resource._id, {content: $scope.newComment}).success(function(res) {
				$scope.newComment = '';
				$scope.resource = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		}
	};

	$scope.deleteComment = function(cmid) {
		Resource.deleteComment($scope.resource._id, cmid).success(function(res) {
			$scope.resource = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});
	};

	$scope.reportDialog = function(event) {
		$mdDialog.show({
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

	function reportController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.confirm = function() {
			$mdDialog.hide($scope.report);
		};
	}
});
