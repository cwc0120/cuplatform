'use strict';

var cupIndex = angular.module('cupIndex', []);
	
cupIndex.factory('User', ['$http', function($http) {
	return {
		validate: function(data) {
			return $http.post('/api/auth', data);
		}
	};
}]);

cupIndex.controller('mainController', ['$scope', '$http', '$window', 'User', function($scope, $http, $window, User) {
	$scope.user = {};

	$scope.sumbitUser = function() {
		if ($scope.user.uid !== undefined && $scope.user.pwd !== undefined) {
			User.validate(user)
				.success(function(result) {
					$window.localStorage['cupToken'] = result.token;
					$window.location.href = result.redirect;
				})
				.error(function(err) {
					$scope.message = err.error;
				});
		}		
	};
}]);