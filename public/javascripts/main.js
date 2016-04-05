'use strict';
angular.module('CUP', ['ngRoute', 'ngMaterial', 'CUPServices', 'CUPControllers', 'textAngular', 'ngMessages', 'md.data.table', 'btford.socket-io'])
	.config(function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
		.primaryPalette('purple')
		.accentPalette('amber')
		.backgroundPalette('grey');
	})

	.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/views/home.html',
				controller: 'homeController',
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
				controller: 'courseInfoController',
				requiredLogin: true
			})

			.when('/resource/:id', {
				templateUrl: '/views/res.html',
				controller: 'resController',
				requiredLogin: true
			})

			.when('/discussion/:id', {
				templateUrl: '/views/threadlist.html',
				controller: 'threadListController',
				requiredLogin: true
			})

			.when('/thread/:id', {
				templateUrl: '/views/thread.html',
				controller: 'threadController',
				requiredLogin: true
			})

			.when('/item', {
				templateUrl: '/views/itemlist.html',
				controller: 'itemListController',
				requiredLogin: true
			})

			.when('/item/:id', {
				templateUrl: '/views/iteminfo.html',
				controller: 'itemInfoController',
				requiredLogin: true
			})

			.when('/messenger', {
				templateUrl: '/views/messenger.html',
				controller: 'messengerController',
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
					if (rejection != undefined && rejection.status == 401) {
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

	.directive('compareTo', function() {
		return {
			require: "ngModel",
			scope: {
				otherModelValue: "=compareTo"
			},
			link: function(scope, element, attributes, ngModel) {

				ngModel.$validators.compareTo = function(modelValue) {
					return modelValue == scope.otherModelValue;
				};

				scope.$watch("otherModelValue", function() {
					ngModel.$validate();
				});
			}
		};
	})

	.filter('htmlToPlaintext', function() {
		return function(text) {
			return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
		};
	});