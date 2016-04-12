'use strict';
ctrl.controller('topController', function($scope, $location, $window, $mdSidenav, Auth, Socket, User) {
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
			$scope.userMenu[0].link = '/user/profile/' + $scope.uid;
			$scope.userMenu[1].link = '/user/timetable/' + $scope.uid;
			User.find($scope.uid).success(function(user) {
				$scope.point = user.points;
				$scope.icon = user.icon;
			});
		}
	});

	$scope.refresh = function() {
		User.find($scope.uid).success(function(user) {
			$scope.point = user.points;
		});
	};

	$scope.logout = function() {
		Auth.logout();
		Socket.disconnect()
	};

	$scope.toggleMenu = function() {
		$mdSidenav('menu').toggle();
	};	
});