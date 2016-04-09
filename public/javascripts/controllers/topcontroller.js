'use strict';
ctrl.controller('topController', function($scope, $location, $window, $mdSidenav, Auth, Socket) {
	$scope.user = {};
	$scope.$location = $location;

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
		link: '/user/profile/' + Auth.uid,
		title: 'Profile',
		icon: 'account_circle'
	},
	{
		link: '/user/timetable',
		title: 'Timetable',
		icon: 'date_range'
	},
	{
		link: '/user/history',
		title: 'Trading History',
		icon: 'history'
	}]

	$scope.$watch(function() {
		return Auth.isLogged;
	}, function(newVal, oldVal) {
		if(typeof newVal !== 'undefined') {
			$scope.isLogged = Auth.isLogged;
		}
	});

	$scope.$watch(function() {
		return Auth.uid;
	}, function(newVal, oldVal) {
		if(typeof newVal !== 'undefined') {
			$scope.uid = Auth.uid;
		}
	});

	$scope.logout = function() {
		Auth.logout();
		Socket.disconnect()
	};

	$scope.toggleMenu = function() {
		$mdSidenav('menu').toggle();
	};	
});