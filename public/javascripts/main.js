'use strict';
angular.module('CUP', ['ngRoute', 'CUPServices', 'CUPControllers', 'textAngular'])
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

			.when('/course/:id', {
				templateUrl: '/views/courseinfo.html',
				controller: 'CourseInfoController',
				requiredLogin: true
			})

			.when('/resource/:id', {
				templateUrl: '/views/reslist.html',
				controller: 'ResListController',
				requiredLogin: true
			})

			.when('/resource/info/:id', {
				templateUrl: '/views/resinfo.html',
				controller: 'ResInfoController',
				requiredLogin: true
			})

			.when('/discussion/:id', {
				templateUrl: '/views/threadlist.html',
				controller: 'ThreadListController',
				requiredLogin: true
			})

			.when('/thread/:id', {
				templateUrl: '/views/thread.html',
				controller: 'ThreadController',
				requiredLogin: true
			})

			.when('/barter', {
				templateUrl: '/views/itemlist.html',
				controller: 'ItemListController',
				requiredLogin: true
			})

			.when('/item/:id', {
				templateUrl: '/views/iteminfo.html',
				controller: 'ItemInfoController',
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
			}
			if (!nextRoute.requiredLogin && Auth.isLogged) {
				$location.path('/');
			}
		});
	})

	.directive('fileModel', function($parse) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var model = $parse(attrs.fileModel);
				var modelSetter = model.assign;

				element.bind('change', function() {
					scope.$apply(function(){
						modelSetter(scope, element[0].files[0]);
					});
				});
			}
		};
	})

	.filter('htmlToPlaintext', function() {
		return function(text) {
			return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
		};
	});