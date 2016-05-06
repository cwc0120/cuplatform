'use strict';

// Module: Profile
// Purpose: 
// 	This module is used to show user information on profile.html using server
// 	data and let user edit his/her user information, upload new
// 	icon and change password
// Interface:
// 	$scope.back: return to previous page if error occurs
// 	$scope.editProfileDialog: edit user's profile
// 	$scope.uploadIconDialog: upload user's icon
// 	$scope.changePwdDialog: change password

ctrl.controller('profileController', function($scope, $window, $location, $routeParams, $mdDialog, $mdToast, User) {
	// Variables
	$scope.$location = $location;
	$scope.uid = $window.localStorage['uid'];
	var uid = $routeParams.uid;

	// Initialization: 
	// send a request to server and once it's successful, display the user 
	// information 
	User.find(uid).success(function(res) {
		$scope.success = true;
		$scope.user = res;
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
	// Name: $scope.editItemDialog
	// Purpose: edit user's profile
	// Input: user id, gender, major, introduction, birthday
	// Output: an updated user object containing uid, admin, email, icon, gender, 
	// 	birthday, major, intro, points, updates
	// Implementation:
	// 	First show a dialog with editprofile.html for user's input. Once received 
	// 	input, send the edit content to the server. The server will update
	// 	user information and send back the updated information which is 
	// 	displayed on the webpage
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

	// controller of editprofile
	function editProfileController($scope, $mdDialog, user) {
		$scope.edit = user;
		$scope.htmlVariable = $scope.edit.intro;

		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm edit and close the dialog
		$scope.editProfile = function() {
			$scope.edit.intro = $scope.htmlVariable;
			$mdDialog.hide($scope.edit);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.uploadIconDialog
	// Purpose: upload user's icon
	// Input: user id, icon image
	// Output: an updated user object containing uid, admin, email, icon, gender, 
	// 	birthday, major, intro, points, updates
	// Implementation:
	// 	First show a dialog with uploadavatar.html for user's input. Once received 
	// 	input, upload the image to the server. The server will update
	// 	user information and send back the updated information which is 
	// 	displayed on the webpage
	$scope.uploadIconDialog = function(event) {
		$mdDialog.show({
			controller: uploadAvatarController,
			templateUrl: '/views/uploadavatar.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose: true
		}).then(function(fd) {
			User.uploadIcon(uid, fd).success(function(res) {
				$mdToast.show($mdToast.simple().textContent('Your avatar is uploaded successfully.'));
				$scope.user = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		});
	};

	// controller of the uploadavatar
	function uploadAvatarController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// append the input into a formdata, then send the formdata to the 
		// server and close the dialog
		$scope.upload = function() {
			var fd = new FormData();
			fd.append('img', $scope.img);
			$mdDialog.hide(fd);
		};
	}

	//--------------------------------------------------------------------------
	// Name: $scope.changePwdDialog
	// Purpose: change password
	// Input: user id, old password, new password, new password confirmation
	// Output: a toast is poped up to remind user
	// Implementation:
	// 	First show a dialog with changepwd.html for user's input. Once received 
	// 	input, send the user's input to the server. The server will validate the
	// 	old password, generate the new salt and hash and update the user.
	// 	If successful, a toast is poped up to inform user
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

	// controller of changepwd
	function changePwdController($scope, $mdDialog) {
		// quit the dialog
		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		// confirm changes and close the dialog
		$scope.change = function() {
			$mdDialog.hide($scope.pwd);
		};
	}
});