'use strict';
angular.module('CUP', ['ngRoute', 'ngMaterial', 'CUPServices', 'CUPControllers', 'textAngular', 'ngMessages', 'md.data.table', 'btford.socket-io'])
	// style configuration
	.config(function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
		.primaryPalette('purple')
		.accentPalette('amber')
		.backgroundPalette('grey');
	})

	// route configuration and access control
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

			.when('/user/profile/:uid', {
				templateUrl: '/views/profile.html',
				controller: 'profileController',
				requiredLogin: true
			})

			.when('/user/history', {
				templateUrl: '/views/tradingrecord.html',
				controller: 'tradingRecordController',
				requiredLogin: true
			})

			.when('/user/timetable/:uid', {
				templateUrl: '/views/timetable.html',
				controller: 'timetableController',
				requiredLogin: true
			})

			.when('/visitor/dept', {
				templateUrl: '/views/deptlistv.html',
				controller: 'deptListController',
				requiredLogin: false
			})

			.when('/visitor/dept/:id', {
				templateUrl: '/views/deptcourselistv.html',
				controller: 'deptCourseListController',
				requiredLogin: false
			})

			.when('/visitor/course/:id', {
				templateUrl: '/views/courseinfov.html',
				controller: 'courseInfoController',
				requiredLogin: false
			})

			.otherwise({
				redirectTo: '/'
			});
	})

	// http configuration
	.config(function($httpProvider) {
		$httpProvider.interceptors.push(function($q, $window, $location) {
			return {
				// attach token in every request so that server can identify user
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

				// if 401 error occurred, clear the localStorage of browser
				responseError: function(rejection) {
					if (rejection != undefined && rejection.status == 401) {
						$window.localStorage.removeItem('uid');
						$window.localStorage.removeItem('icon');
						$window.localStorage.removeItem('admin');
						$window.localStorage.removeItem('cupToken');
						$location.path('/');
					}
					return $q.reject(rejection);
				}
			};
		});
	})

	// access control
	// logged-in user cannot access visitor page, reroute to / (login page)
	// visiter cannot access restricted page, reroute to / (homepage)
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

	// upload file model
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

	// compare password confirmation model
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

	// filter to remove html tag
	.filter('htmlToPlaintext', function() {
		return function(text) {
			return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
		};
	});