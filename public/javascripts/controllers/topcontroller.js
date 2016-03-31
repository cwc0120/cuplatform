'use strict';
ctrl.controller('topController', function($scope, $location, $window, $mdSidenav, Auth) {
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
		icon: 'chat'
	},
	{
		link: '/item',
		title: 'Trading Platform',
		icon: 'shopping_basket'
	}];

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
	};

	$scope.toggleMenu = function() {
		$mdSidenav('menu').toggle();
	};	
});