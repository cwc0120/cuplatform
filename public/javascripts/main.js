'use strict';
angular.module('CUP', ['ngRoute', 'CUPServices', 'CUPControllers'])
	.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/views/home.html',
				controller: 'homeController',
				requiredLogin: false
			})

			.when('/register', {
				templateUrl: '/views/register.html',
				controller: 'registerController',
				requiredLogin: false
			})

			.when('/task', {
				templateUrl: '/views/task.html',
				controller: 'taskController',
				requiredLogin: true
			})
			.otherwise({
				redirectTo: '/'
			});
	})

	.config(function($httpProvider) {
		$httpProvider.interceptors.push('TokenInterceptor');
	})

	.run(function($rootScope, $location, $window, Auth) {
		$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
			if (nextRoute !== null && nextRoute.requiredLogin && !Auth.isLogged() && !Auth.getToken()) {
				$location.path('/');
				console.log('Please log in');
			}
			if (!nextRoute.requiredLogin && Auth.isLogged() && Auth.getToken()) {
				$location.path('/task');
				console.log('Magic');
			}
		});
	});