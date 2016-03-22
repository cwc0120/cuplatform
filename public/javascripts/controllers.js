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
			$scope.errorMessage = data.error;
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
				$scope.errorMessage = data.error;
			});
		};

		$scope.edit = function(id) {
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
					$scope.errorMessage = data.error;
				});
			}
		};

		$scope.delete = function(id) {
			Todos.delete(id).success(function(data) {
				$scope.editing = false;
				$scope.todos = data;
			}).error(function(data) {
				$scope.success = false;
				$scope.errorMessage = data.error;
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

	.controller('deptListController', function($scope, $window, $location, $route, Dept) {
		$scope.$location = $location;
		$scope.$route = $route;
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

	.controller('deptCourseListController', function($scope, $window, $location, $routeParams, $route, Dept, Course) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.editing = false;
		$scope.adding = false;
		$scope.edit = {};
		$scope.newCourse = {};
		$scope.days = Course.days;
		$scope.times = Course.times;
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
			if (!($scope.newCourse.courseCode === undefined || $scope.newCourse.courseCode === '')) {
				$scope.newCourse.schedule = [];
				for (var i=0; i < $scope.lessons.length; i++) {
					$scope.newCourse.schedule.push({			
						day: $scope.lessons[i].day.index,
						time: $scope.lessons[i].time.index,
						venue: $scope.lessons[i].venue
					});
				}
				Course.create(deptCode, $scope.newCourse).success(function(res) {
					$scope.adding = false;
					$scope.newCourse = {};
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
	})

	.controller('CourseInfoController', function($scope, $window, $location, $routeParams, $route, Course) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.editing = false;
		$scope.adding = false;
		$scope.edit = {};
		$scope.newInfo = {};
		$scope.lessons = [];
		$scope.days = Course.days;
		$scope.times = Course.times;
		$scope.ratings = Course.ratings;
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		var courseCode = $routeParams.id;

		Course.getOne(courseCode).success(function(res) {
			$scope.success = true;
			$scope.course = res;
			if (res.schedule !== null) {
				for (var i=0; i<res.schedule.length; i++) {
					$scope.lessons.push({
						day: {
							index: res.schedule[i].day,
							val: $scope.days[res.schedule[i].day-1].val
						},
						time: {
							index: res.schedule[i].time,
							val: $scope.times[res.schedule[i].time-1].val,
						},
						venue: res.schedule[i].venue
					});
				}
			}
			
			for (var i=0; i<$scope.course.info.length; i++) {
				if ($scope.course.info[i].author === $window.localStorage['uid']) {
					$scope.posted = true;
				}
			}
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.enableEdit = function() {
			if (!$scope.editing) {
				$scope.editing = true;
			}
		};

		$scope.editCourse = function() {
			$scope.edit.schedule = [];
				for (var i=0; i < $scope.lessons.length; i++) {
					$scope.edit.schedule.push({			
						day: $scope.lessons[i].day.index,
						time: $scope.lessons[i].time.index,
						venue: $scope.lessons[i].venue
					});
				}
			Course.edit(courseCode, $scope.edit).success(function(res) {
				$scope.editing = false;
				$scope.edit = {};
				$scope.lessons = [];
				$scope.course = res;
				for (var i=0; i<res.schedule.length; i++) {
				$scope.lessons.push({
					day: {
						index: res.schedule[i].day,
						val: $scope.days[res.schedule[i].day-1].val
					},
					time: {
						index: res.schedule[i].time,
						val: $scope.times[res.schedule[i].time-1].val,
					},
					venue: res.schedule[i].venue
				});
			}
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
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

		$scope.enableAdd = function() {
			if (!$scope.adding) {
				$scope.adding = true;
			}
		};

		$scope.addInfo = function() {
			$scope.newInfo.rating = $scope.rating.index;
			if (!($scope.newInfo.rating === undefined || $scope.newInfo.rating === '' ||
				$scope.newInfo.outline === undefined || $scope.newInfo.outline.length < 30 ||
				$scope.newInfo.assessMethod === undefined || $scope.newInfo.assessMethod.length <30 ||
				$scope.newInfo.comment === undefined || $scope.newInfo.comment.length < 30)) {

				Course.postInfo(courseCode, $scope.newInfo).success(function(res) {
					$scope.adding = false;
					$scope.posted = true;
					$scope.newInfo = {};
					$scope.course = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		};

		$scope.deleteInfo = function(cmid) {
			Course.deleteInfo(courseCode, cmid).success(function(res) {
				$scope.course = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	})

	.controller('ResListController', function($scope, $window, $location, $routeParams, $route, Resource) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.adding = false;
		$scope.name = '';
		$scope.description = '';
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		$scope.courseCode = $routeParams.id;

		Resource.get($scope.courseCode.toUpperCase()).success(function(res) {
			$scope.success = true;
			$scope.ress = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.enableAdd = function() {
			if (!$scope.adding) {
				$scope.adding = true;
			}
		};

		$scope.addResource = function() {
			$scope.description = $scope.htmlVariable;
			if ($scope.name !== '' && $scope.description !== undefined && $scope.description !== '') {
				var fd = new FormData();
				fd.append('file', $scope.file);
				fd.append('name', $scope.name);
				fd.append('description', $scope.description);
				Resource.create($scope.courseCode, fd).success(function(res) {
					$scope.adding = false;
					$scope.name = '';
					$scope.file = {};
					$scope.description = '';
					$scope.htmlVariable = '';
					$scope.ress = res;
				}).error(function(res){
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}	
		};

		$scope.delete = function(id) {
			Resource.delete(id).success(function(res) {
				$scope.ress = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	})

	.controller('ResInfoController', function($scope, $window, $location, $routeParams, $route, Resource) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.editing = false;
		$scope.adding = false;
		$scope.edit = {};
		$scope.newComment = '';
		$scope.uid = $window.localStorage['uid'];
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		var resID = $routeParams.id;

		Resource.getOne(resID).success(function(res) {
			$scope.success = true;
			$scope.resource = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.download = function() {
			var a = document.createElement("a");
			document.body.appendChild(a);
			a.style = "display: none";
			Resource.getRes($scope.resource.link).then(function (result) {
				var file = new Blob([result.data], {type: result.data.type});
				var fileURL = window.URL.createObjectURL(file);
				a.href = fileURL;
				a.download = $scope.resource.link;
				a.click();
			});
		};

		$scope.enableEdit = function() {
			if (!$scope.editing) {
				$scope.editing = true;
			}
		};

		$scope.editResource = function() {
			$scope.edit.description = $scope.htmlVariable;
			if ($scope.edit.name !== '' && $scope.edit.description !== undefined && 
				$scope.edit.description !== '') {
					Resource.edit(resID, $scope.edit).success(function(res) {
						$scope.editing = false;
						$scope.edit = {};
						$scope.htmlVariable = '';
						$scope.resource = res;
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

		$scope.addComment = function() {
			if ($scope.newComment !== '') {
				Resource.postComment(resID, {content: $scope.newComment}).success(function(res) {
					$scope.adding = false;
					$scope.newComment = '';
					$scope.resource = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		};

		$scope.deleteComment = function(cmid) {
			Resource.deleteComment(resID, cmid).success(function(res) {
				$scope.resource = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	})

	.controller('ThreadListController', function($scope, $window, $location, $routeParams, $route, Thread) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.adding = false;
		$scope.newThread = {};
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		if ($routeParams.id === 'GENERAL') {
			$scope.code = 'General';
		} else {
			$scope.code = $routeParams.id;
		}
		
		Thread.get($scope.code).success(function(res) {
			$scope.success = true;
			$scope.threads = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.enableAdd = function() {
			if (!$scope.adding) {
				$scope.adding = true;
			}
		};

		$scope.addThread = function() {
			$scope.newThread.content = $scope.htmlVariable;
			if ($scope.newThread.topic !== undefined && $scope.newThread.topic !== '' && 
				$scope.newThread.content !== undefined && $scope.newThread.content !== '') {
				Thread.create($scope.code, $scope.newThread).success(function(res) {
					$scope.adding = false;
					$scope.newThread = {};
					$scope.htmlVariable = '';
					$scope.threads = res;
				}).error(function(res){
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}	
		};

		$scope.delete = function(id) {
			Thread.delete(id).success(function(res) {
				$scope.threads = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	})

	.controller('ThreadController', function($scope, $window, $location, $routeParams, $route, Thread) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.editing = false;
		$scope.adding = false;
		$scope.editContent = '';
		$scope.newComment = '';
		$scope.uid = $window.localStorage['uid'];
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		var threadID = $routeParams.id;

		Thread.getOne(threadID).success(function(res) {
			$scope.success = true;
			$scope.thread = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.enableEdit = function() {
			if (!$scope.editing) {
				$scope.editing = true;
			}
		};

		$scope.editThread = function() {
			$scope.editContent = $scope.htmlVariable;
			if ($scope.editContent !== '') {
				Thread.edit(threadID, {content: $scope.editContent}).success(function(res) {
					$scope.editing = false;
					$scope.editContent = '';
					$scope.htmlVariable = '';
					$scope.thread = res;
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

		$scope.addComment = function() {
			if ($scope.newComment !== '') {
				Thread.postComment(threadID, {content: $scope.newComment}).success(function(res) {
					$scope.adding = false;
					$scope.newComment = '';
					$scope.thread = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		};

		$scope.deleteComment = function(cmid) {
			Thread.deleteComment(threadID, cmid).success(function(res) {
				$scope.thread = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	})

	.controller('ItemListController', function($scope, $window, $location, $routeParams, $route, Item) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.adding = false;
		$scope.newItem = {};
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		$scope.sortType = 'date';
		$scope.sortReverse = false;
		$scope.searchDept = '';
		
		Item.get().success(function(res) {
			$scope.success = true;
			$scope.items = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.enableAdd = function() {
			if (!$scope.adding) {
				$scope.adding = true;
			}
		};

		$scope.addItem = function() {
			$scope.newItem.description = $scope.htmlVariable;
			if ($scope.newItem.name !== undefined && $scope.newItem.name !== '' && 
				$scope.newItem.price !== undefined && $scope.newItem.price !== '' &&
				$scope.newItem.description !== undefined && $scope.newItem.description !== '') {
				Item.create($scope.newItem).success(function(res) {
					$scope.adding = false;
					$scope.newItem = {};
					$scope.htmlVariable = '';
					$scope.items = res;
				}).error(function(res){
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}	
		};

		$scope.delete = function(id) {
			Item.delete(id).success(function(res) {
				$scope.items = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	});