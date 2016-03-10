'use strict';

var cupTodo = angular.module('cupTodo', [])
	.factory('Todos', ['$http', function($http) {
		return {
			get: function() {
				return $http.get('/api/todo');
			},
			create: function(data) {
				return $http.post('/api/todo', data);
			},
			edit: function(id, data) {
				return $http.put('/api/todo/' + id, data);
			},
			delete: function(id) {
				return $http.delete('/api/todo/' + id);
			}
		}
	}])
	.controller('mainController', ['$scope', '$http', 'Todos', function($scope, $http, Todos) {
		$scope.newTask = {};
		$scope.editTask = {};
		$scope.editing = false;

		Todos.get().success(function(data){
			$scope.todos = data;
		});

		$scope.create = function() {
			if ($scope.newTask.content == undefined)
				return;
			Todos.create($scope.newTask).success(function(data) {
				$scope.newTask = {};
				$scope.todos = data;
			});
		};

		$scope.edit = function(id) {
			$scope.editing = false;
			if ($scope.editTask.content == undefined)
				return false;
			Todos.edit(id, $scope.editTask).success(function(data) {
				$scope.editTask = {};
				$scope.todos = data;
				return false;
			});
		};

		$scope.delete = function(id) {
			Todos.delete(id).success(function(data) {
				$scope.todos = data;
			});
		};

		$scope.enableEdit = function(data) {
			if (!$scope.editing) {
				$scope.editing = true;
				return true;
			}
		};
	}]);