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

			.when('/dept', {
				templateUrl: '/views/deptlist.html',
				controller: 'deptListController',
				requiredLogin: true
			})

			.when('/dept/:id', {
				templateUrl: '/views/deptcourselist.html',
				controller: 'deptCourseListController',
				requiredLogin: true
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
		$httpProvider.interceptors.push(function($q, $window, $location) {
			return {
				request: function(config) {
					config.headers = config.headers || {};
					var token = $window.localStorage['cupToken'];
					if (token) {
						config.headers['x-access-token'] = token;
					}
					return config;
				},

				response: function(response) {
					return response;
				},

				responseError: function(rejection) {
					if (rejection != undefined && rejection.status == 403) {
						$window.localStorage.removeItem('uid');
						$window.localStorage.removeItem('admin');
						$window.localStorage.removeItem('cupToken');
						$location.path('/');
					}
					return $q.reject(rejection);
				}
			};
		});
	})

	.run(function($rootScope, $location, $window, Auth) {
		$rootScope.$on('$routeChangeStart', function(event, nextRoute) {
			if (nextRoute !== null && nextRoute.requiredLogin && !Auth.isLogged) {
				$location.path('/');
				console.log('Please log in');
			}
			if (!nextRoute.requiredLogin && Auth.isLogged) {
				$location.path('/task');
				console.log('Magic');
			}
		});
	});