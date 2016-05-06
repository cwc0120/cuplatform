'use strict';

// Module: Top
// Purpose: 
// 	This module is used to manage the action of sidebar and navigation bar
// Interface:
// 	$scope.refresh: refresh user's point
// 	$scope.logout: logout
// 	$scope.toggleMenu: toggle the side bar

ctrl.controller('topController', function($scope, $location, $window, $mdSidenav, Auth, Socket, User) {
	// Variables
	$scope.user = {};
	$scope.$location = $location;

	// side bar content
	$scope.menu = [{
		link: '/',
		title: 'Home',
		icon: 'home'
	},
	{
		link: '/dept',
		title: 'Courses',
		icon: 'library_books'
	},
	{
		link: '/discussion/GENERAL',
		title: 'Discussion',
		icon: 'forum'
	},
	{
		link: '/item',
		title: 'Trading Platform',
		icon: 'shopping_basket'
	},
	{
		link: '/messenger',
		title: 'Messages',
		icon: 'chat'
	}];

	$scope.userMenu = [{
		link: '/user/profile/' + $scope.uid,
		title: 'Profile',
		icon: 'account_circle'
	},
	{
		link: '/user/timetable/' + $scope.uid,
		title: 'Timetable',
		icon: 'date_range'
	},
	{
		link: '/user/history',
		title: 'Trading History',
		icon: 'history'
	}]

	// check the state of the user (logged-in or logged-out) to determine the
	// content on the website.
	// if the user is logged-in, side bar with courses, trading platform, etc is
	// shown
	// otherwise, 'please log in' is shown in side bar
	$scope.$watch(function() {
		return Auth.isLogged;
	}, function(newVal, oldVal) {
		if(typeof newVal !== 'undefined') {
			$scope.isLogged = Auth.isLogged;
		}
	});

	// check user id to set links to profile and timetable correctly
	// and show user id and point in the side bar
	$scope.$watch(function() {
		return Auth.uid;
	}, function(newVal, oldVal) {
		if(typeof newVal !== 'undefined') {
			$scope.uid = Auth.uid;
			$scope.userMenu[0].link = '/user/profile/' + $scope.uid;
			$scope.userMenu[1].link = '/user/timetable/' + $scope.uid;
			User.find($scope.uid).success(function(user) {
				$scope.point = user.points;
				$scope.icon = user.icon;
			});
		}
	});

	//--------------------------------------------------------------------------
	// Name: $scope.refresh
	// Purpose: refresh user's point
	// Input: user id
	// Output: point updated
	// Implementation:
	// 	Send a request to the server. The server will find user record and send 
	// 	back user's point which is displayed on the webpage.
	$scope.refresh = function() {
		User.find($scope.uid).success(function(user) {
			$scope.point = user.points;
		});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.logout
	// Purpose: logout
	// Input: none
	// Output: none
	// Implementation:
	// 	clear all the localStorage in the browser and disconnect socket
	$scope.logout = function() {
		Auth.logout();
		Socket.disconnect()
	};

	//--------------------------------------------------------------------------
	// Name: $scope.toggleMenu
	// Purpose: toggle the side bar
	// Input: none
	// Output: none
	$scope.toggleMenu = function() {
		$mdSidenav('menu').toggle();
	};	
});