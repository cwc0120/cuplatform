'use strict';
angular.module('CUPControllers', [])
	.controller('topBarController', function($scope, $location, $window, Auth) {
		$scope.user = {};
		$scope.$location = $location;

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

		$scope.login = function() {
			if ($scope.user.uid !== undefined && $scope.user.pwd !== undefined) {
				Auth.login($scope.user).success(function(res) {
					$scope.user = {};
					Auth.uid = res.uid;
					Auth.isLogged = true;	
					Auth.setToken(res);
					$location.path('/task');
				}).error(function(err) {
					$scope.message = err.error;
				});
			}
		};

		$scope.register = function() {
			$location.path('/register');
		};

		$scope.logout = function() {
			Auth.logout();
		};
	})

	.controller('homeController', function($scope) {
		$scope.user = {};

	})

	.controller('registerController', function($scope, $location, Auth) {
		$scope.newUser = {};
		$scope.disable = true;

		var alphanum = new RegExp('^[a-zA-Z0-9]*$');
		var cuemail = new RegExp('@link.cuhk.edu.hk');
		var uidChecked = false;
		var emailChecked = false;
		var pwd1Checked = false;
		var pwd2Checked = false;

		$scope.checkUid = function() {
			if (!alphanum.test($scope.newUser.uid)) {
				$scope.uidStatus = 'User ID should be alphanumeric.';
				uidChecked = false;
				$scope.disable = setDisable();
			} else {
				$scope.uidStatus = '';
				uidChecked = true;
				$scope.disable = setDisable();
			}
		};

		$scope.checkEmail = function() {
			if (!cuemail.test($scope.newUser.email)) {
				$scope.emailStatus = 'CUHK email should be provided.';
				emailChecked = false;
				$scope.disable = setDisable();
			} else {
				$scope.emailStatus = '';
				emailChecked = true;
				$scope.disable = setDisable();
			}
		};

		$scope.checkPwd1 = function() {
			if (!alphanum.test($scope.newUser.pwd1)) {
				$scope.pwd1Status = 'Password should be alphanumeric.';
				pwd1Checked = false;
				$scope.disable = setDisable;
			} else if ($scope.newUser.pwd1.length < 8) {
				$scope.pwd1Status = 'Password should be longer than 7 characters';
				pwd1Checked = false;
				$scope.disable = setDisable();
			} else {
				$scope.pwd1Status = '';
				pwd1Checked = true;
				$scope.disable = setDisable();
			}
		};

		$scope.checkPwd2 = function() {
			if ($scope.newUser.pwd1 !== $scope.newUser.pwd2) {
				$scope.pwd2Status = 'Password not matched';
				pwd2Checked = false;
				$scope.disable = setDisable();
			} else {
				$scope.pwd2Status = '';
				pwd2Checked = true;
				$scope.disable = setDisable();
			}
		};

		$scope.createUser = function() {
			Auth.register($scope.newUser).success(function(result) {
				Auth.login({uid: $scope.newUser.uid, pwd: $scope.newUser.pwd1}).success(function(res) {
					Auth.uid = res.uid;
					Auth.isLogged = true;	
					Auth.setToken(res);
					$location.path('/task');
				}).error(function(err) {
					$scope.message = err.error;
				});
			}).error(function(err) {
				$scope.message = err.error;
			});
		};

		function setDisable() {
			if (uidChecked && emailChecked && pwd1Checked && pwd2Checked) {
				return false;
			} else {
				return true;
			}
		}
	})

	.controller('taskController', function($scope, $window, $location, Todos, Auth) {
		$scope.newTask = {};
		$scope.editTask = {};
		$scope.editing = false;
		$scope.uid = $window.localStorage['uid'];
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		Todos.get().success(function(data){
			$scope.success = true;
			$scope.todos = data;
		}).error(function(data) {
			$scope.success = false;
			$scope.errorMessage = data.message;
		});

		$scope.create = function() {
			if ($scope.newTask.content === undefined) {
				return;
			}
			Todos.create($scope.newTask).success(function(data) {
				$scope.newTask = {};
				$scope.todos = data;
			}).error(function(data) {
				$scope.success = false;
				$scope.errorMessage = data.message;
			});
		};

		$scope.edit = function(id) {
			console.log($scope.editTask.content);
			if ($scope.editTask.content === '') {
				return true;
			} else {
				Todos.edit(id, $scope.editTask).success(function(data) {
					$scope.editing = false;
					$scope.editTask = {};
					$scope.todos = data;
					return false;
				}).error(function(data) {
					$scope.success = false;
					$scope.errorMessage = data.message;
				});
			}
		};

		$scope.delete = function(id) {
			Todos.delete(id).success(function(data) {
				$scope.editing = false;
				$scope.todos = data;
			}).error(function(data) {
				$scope.success = false;
				$scope.errorMessage = data.message;
			});
		};

		$scope.enableEdit = function(data) {
			if (!$scope.editing && data.user === $scope.uid) {
				$scope.editing = true;
				return true;
			}
		};

		$scope.return = function() {
			$location.path('/');
		};
	})

	.controller('deptListController', function($scope, $window, $location, Dept) {
		$scope.$location = $location;
		$scope.newDept = {};
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		Dept.get().success(function(res){
			$scope.success = true;
			$scope.depts = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.add = function() {
			if (!($scope.newDept.deptCode === undefined || $scope.newDept.deptCode === '')) {
				Dept.create($scope.newDept).success(function(res) {
					$scope.newDept = {};
					$scope.depts = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
			
		};

		$scope.delete = function(deptCode) {
			Dept.delete(deptCode).success(function(res) {
				$scope.depts = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	})

	.controller('deptCourseListController', function($scope, $window, $location, $routeParams, Dept, Course) {
		$scope.$location = $location;
		$scope.editing = false;
		$scope.adding = false;
		$scope.edit = {};
		$scope.newCourse = {};
		$scope.term = {};
		$scope.days = Course.days;
		$scope.times = Course.times;
		$scope.terms = Course.terms;
		$scope.lessons = [];
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		var deptCode = $routeParams.id;

		Dept.getOne(deptCode).success(function(res) {
			$scope.success = true;
			$scope.dept = res;
			Course.get(deptCode).success(function(res1) {
				$scope.courses = res1;
			}).error(function(res1) {
				$scope.success = false;
				$scope.errorMessage = res1.error;
			});
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.enableEdit = function() {
			if (!$scope.editing) {
				$scope.editing = true;
			}
		};

		$scope.editDept = function() {
			if ($scope.edit.deptName === undefined || $scope.edit.deptName === '') {
				$scope.editing = true;
			} else {
				Dept.edit(deptCode, $scope.edit).success(function(res) {
					$scope.editing = false;
					$scope.dept = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
			
		};

		$scope.enableAdd = function() {
			if (!$scope.adding) {
				$scope.adding = true;
			}
		};

		$scope.addLesson = function() {
			var lesson = {
				day: $scope.day,
				time: $scope.time,
				venue: $scope.venue
			};
			$scope.lessons.push(lesson);
		};

		$scope.removeLesson = function(index) {
			$scope.lessons.splice(index, 1);
		};

		$scope.addCourse = function() {
			if (!($scope.newCourse.courseCode === undefined || $scope.newCourse.courseCode=== '')) {
				$scope.newCourse.schedule = [];
				for (var lesson in $scope.lessions) {
					$scope.newCourse.schedule.push({
						day: lesson.day.index,
						time: lesson.time.index,
						venue: lesson.venue
					});
				}
				$scope.newCourse.term = $scope.term.index;
				Course.create(deptCode, $scope.newCourse).success(function(res) {
					$scope.adding = false;
					$scope.newCourse = {};
					$scope.term = {};
					$scope.lessons = [];
					$scope.courses = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		};

		$scope.delete = function(courseCode) {
			Course.delete(courseCode).success(function(res) {
				$scope.courses = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	});
