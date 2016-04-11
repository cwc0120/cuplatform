'use strict';
ctrl.controller('profileController', function($scope, $window, $location, $routeParams, $mdDialog, $mdToast, User) {
	$scope.$location = $location;
	$scope.uid = $window.localStorage['uid'];

	var uid = $routeParams.uid;

	User.find(uid).success(function(res) {
		$scope.success = true;
		$scope.user = res;
	}).error(function(res) {
		$scope.success = false;
		$scope.errorMessage = res.error;
	});

	$scope.back = function() {
		window.history.back();
	};

	$scope.editProfileDialog = function(event) {
		$mdDialog.show({
			controller: editProfileController,
			templateUrl: '/views/editprofile.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true,
			locals: {
				user: $scope.user
			}
		}).then(function(edit) {
			User.editProfile(uid, edit).success(function(res) {
				$scope.user = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function editProfileController($scope, $mdDialog, user) {
		$scope.edit = user;
		$scope.htmlVariable = $scope.edit.intro;

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.editProfile = function() {
			$scope.edit.intro = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

	$scope.uploadIconDialog = function(event) {
		$mdDialog.show({
			controller: uploadAvatarController,
			templateUrl: '/views/uploadavatar.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		}).then(function(fd) {
			User.uploadIcon(uid, fd).success(function(res) {
				$mdToast.show($mdToast.simple().textContent('Password is changed. Please log in again.'));
				$scope.user = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function uploadAvatarController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.upload = function() {
			var fd = new FormData();
			fd.append('img', $scope.img);
			$mdDialog.hide(fd);
		};
	}

	$scope.changePwdDialog = function(event) {
		$mdDialog.show({
			controller: changePwdController,
			templateUrl: '/views/changepwd.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		}).then(function(pwd) {
			User.changePwd(uid, pwd).success(function(res) {
				$mdToast.show($mdToast.simple().textContent('Password is changed. Please log in again.'));
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	function changePwdController($scope, $mdDialog) {
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.change = function() {
			$mdDialog.hide($scope.pwd);
		};
	}
});