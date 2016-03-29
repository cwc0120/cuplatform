'use strict';
angular.module('CUPControllers', [])
	.controller('topController', function($scope, $location, $window, $mdSidenav, Auth) {
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
			link: '/barter',
			title: 'Barter',
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

		
	})

	.controller('homeController', function($scope, $location, $mdDialog, Auth) {
		$scope.user = {};
		$scope.disable = true;
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
					$scope.loginMessage = err.error;
				});
			}
		};

		$scope.registerDialog = function(event) {
			$mdDialog.show({
				controller: RegisterController,
				templateUrl: '/views/register.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose: true
			})
			.then(function(newUser) {
				Auth.login({uid: newUser.uid, pwd: newUser.pwd1}).success(function(res) {
					Auth.uid = res.uid;
					Auth.isLogged = true;
					Auth.setToken(res);
					$location.path('/task');
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			});
		};

		function RegisterController($scope, $mdDialog, Auth) {
			$scope.newUser = {};

			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.createUser = function() {
				Auth.register($scope.newUser).success(function(result) {
					$mdDialog.hide($scope.newUser);
				}).error(function(err) {
					$scope.registerMessage = err.error;
				});
			};
		}
	})

	.controller('deptListController', function($scope, $window, $location, $mdDialog, $mdMedia, $mdEditDialog, Dept) {
		$scope.$location = $location;
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		$scope.order = 'deptCode';
		$scope.limit = 10;
		$scope.page = 1;
		$scope.selected = [];

		Dept.get().success(function(res){
			$scope.success = true;
			$scope.depts = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.back = function() {
			window.history.back();
		};

		$scope.addDialog = function(event) {
			$mdDialog.show({
				controller: AddDeptController,
				templateUrl: '/views/adddept.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose: true
			})
			.then(function(newDept) {
				Dept.create(newDept).success(function(res) {
					$scope.depts = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			});
		};

		function AddDeptController($scope, $mdDialog) {
			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.add = function() {
				$mdDialog.hide($scope.newDept);
			};
		}

		$scope.editDeptName = function(event, dept) {
			if ($scope.admin) {
				event.stopPropagation();
				$mdEditDialog.large({
					title: 'Edit department name',
					modelValue: dept.deptName,
					save: function(input) {
						console.log(input.$modelValue);
						Dept.edit(dept.deptCode, {deptName: input.$modelValue}).success(function(res) {
							$scope.depts = res;
						}).error(function(res) {
							$scope.success = false;
							$scope.errorMessage = res.error;
						});
					},
					targetEvent: event,
					validators: {'required': true}
				});
			}
		};

		$scope.delete = function() {
			async.each($scope.selected, deleteDept, function(err) {
				if (err) {
					$scope.success = false;
					$scope.errorMessage = err;
				} else {
					$scope.selected = [];
					Dept.get().success(function(res){
						$scope.depts = res;
					}).error(function(res) {
						$scope.success = false;
						$scope.errorMessage = res.error;
					});	
				}
			});
		};

		function deleteDept(e, cb) {
			Dept.delete(e.deptCode).success(function(res) {
				cb();
			}).error(function(res) {
				cb(res.error);
			});
		}
	})

	.controller('deptCourseListController', function($scope, $window, $location, $routeParams, $mdDialog, Dept, Course) {
		$scope.$location = $location;
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		$scope.order = 'courseCode';
		$scope.limit = 10;
		$scope.page = 1;
		$scope.selected = [];

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

		$scope.back = function() {
			window.history.back();
		};

		$scope.addDialog = function(event) {
			$mdDialog.show({
				controller: AddCourseController,
				templateUrl: '/views/addcourse.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose: true
			})
			.then(function(newCourse) {
				Course.create(deptCode, newCourse).success(function(res) {
					$scope.courses = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			});
		};

		function AddCourseController($scope, $mdDialog, Course) {
			$scope.days = Course.days;
			$scope.times = Course.times;
			$scope.lessons = [];
			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.addLesson = function() {
				var newlesson = {
					day: $scope.day,
					time: $scope.time,
					venue: $scope.venue
				};
				$scope.lessons.push(newlesson);
			};

			$scope.removeLesson = function(index) {
				$scope.lessons.splice(index, 1);
			};

			$scope.add = function() {
				$scope.newCourse.schedule = $scope.lessons;
				$mdDialog.hide($scope.newCourse);
			};
		}

		$scope.delete = function() {
			async.each($scope.selected, deleteCourse, function(err) {
				if (err) {
					$scope.success = false;
					$scope.errorMessage = err;
				} else {
					$scope.selected = [];
					Course.get(deptCode).success(function(res) {
						$scope.courses = res;
					}).error(function(res) {
						$scope.success = false;
						$scope.errorMessage = res.error;
					});
				}
			});
		};

		function deleteCourse(e, cb) {
			Course.delete(e.courseCode).success(function(res) {
				cb();
			}).error(function(res) {
				cb(res.error);
			});
		}
	})

	.controller('CourseInfoController', function($scope, $window, $location, $routeParams, $mdDialog, Course) {
		$scope.$location = $location;
		$scope.days = Course.days;
		$scope.times = Course.times;
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		var courseCode = $routeParams.id;

		// Initialization
		Course.getOne(courseCode).success(function(res) {
			$scope.success = true;
			$scope.course = res;
			$scope.lessons = res.schedule;
			$scope.avgRating = 0;
			for (var i=0; i<$scope.course.info.length; i++) {
				$scope.avgRating += $scope.course.info[i].rating;
				if ($scope.course.info[i].author === $window.localStorage['uid']) {
					$scope.posted = true;
				}
			}
			$scope.avgRating /= $scope.course.info.length;
			$scope.avgRating = Math.round($scope.avgRating * 100) / 100;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		// error return
		$scope.back = function() {
			window.history.back();
		};

		// Course basic module -----------------------------------------------
		$scope.editCourseDialog = function(event) {
			$mdDialog.show({
				controller: EditCourseController,
				templateUrl: '/views/editcourse.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose: true,
				locals: {
					course: $scope.course
				}
			})
			.then(function(edit) {
				Course.edit(courseCode, edit).success(function(res) {
					$scope.course = res;
					$scope.lessons = res.schedule;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			});
		};

		function EditCourseController($scope, $mdDialog, Course, course) {
			$scope.days = Course.days;
			$scope.times = Course.times;
			$scope.edit = course;
			$scope.editLessons = course.schedule || [];

			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.addLesson = function() {
				var newlesson = {
					day: $scope.day,
					time: $scope.time,
					venue: $scope.venue
				};
				$scope.editLessons.push(newlesson);
			};

			$scope.removeLesson = function(index) {
				$scope.editLessons.splice(index, 1);
			};

			$scope.editCourse = function() {
				$scope.edit.schedule = $scope.editLessons;
				console.log($scope.edit);
				$mdDialog.hide($scope.edit);
			};
		}

		// Course info module -----------------------------------------------
		$scope.addInfoDialog = function(event) {
			$mdDialog.show({
				controller: AddCourseInfoController,
				templateUrl: '/views/addcourseinfo.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose: true,
			})
			.then(function(newInfo) {
				Course.postInfo(courseCode, newInfo).success(function(res) {
					$scope.posted = true;
					$scope.course = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			});
		};

		function AddCourseInfoController($scope, $mdDialog) {
			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.addCourseInfo= function() {
				$mdDialog.hide($scope.newInfo);
			};
		}

		$scope.deleteInfo = function(cmid) {
			Course.deleteInfo(courseCode, cmid).success(function(res) {
				$scope.course = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	})

	.controller('ResListController', function($scope, $window, $location, $routeParams, $route, $mdDialog, Resource) {
		$scope.$location = $location;
		$scope.$route = $route;
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		$scope.courseCode = $routeParams.id.toUpperCase();
		$scope.order = 'name';
		$scope.limit = 5;
		$scope.page = 1;
		$scope.selected = [];

		Resource.get($scope.courseCode).success(function(res) {
			$scope.success = true;
			$scope.ress = res;
		}).error(function(res) {
			$scope.success = false;
			$scope.errorMessage = res.error;
		});

		$scope.back = function() {
			window.history.back();
		};

		$scope.addResDialog = function(event) {
			$mdDialog.show({
				controller: AddResController,
				templateUrl: '/views/addres.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose: true
			})
			.then(function(fd) {
				Resource.create($scope.courseCode, fd).success(function(res) {
					$scope.ress = res;
				}).error(function(res){
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			});
		};

		function AddResController($scope, $mdDialog) {
			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.addResource = function() {
				var fd = new FormData();
				$scope.description = $scope.htmlVariable;
				fd.append('file', $scope.file);
				fd.append('name', $scope.name);
				fd.append('description', $scope.description);
				$mdDialog.hide(fd);
			};
		}

		$scope.check = function(id) {
			Resource.getOne(id).success(function(res) {
				$scope.success = true;
				$scope.resource = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};

		$scope.delete = function() {
			async.each($scope.selected, deleteRes, function(err) {
				if (err) {
					$scope.success = false;
					$scope.errorMessage = err;
				} else {
					$scope.selected = [];
					Resource.get($scope.courseCode).success(function(res) {
						$scope.ress = res;
					}).error(function(res) {
						$scope.success = false;
						$scope.errorMessage = res.error;
					});
				}
			});
		};

		function deleteRes(e, cb) {
			Resource.delete(e._id).success(function(res) {
				cb();
			}).error(function(res) {
				cb(res.error);
			});
		}

		$scope.editResDialog = function(event) {
			$mdDialog.show({
				controller: EditResController,
				templateUrl: '/views/editres.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose: true,
			})
			.then(function(edit) {
				Resource.edit($scope.resource._id, edit).success(function(res) {
					$scope.resource = res;
					Resource.get($scope.courseCode).success(function(res1) {
						$scope.ress = res1;
					}).error(function(res) {
						$scope.success = false;
						$scope.errorMessage = res.error;
					});
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			});
		};

		function EditResController($scope, $mdDialog) {
			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.editResource = function() {
				$scope.edit.description = $scope.htmlVariable;
				$mdDialog.hide($scope.edit);
			};
		}

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

		$scope.addComment = function() {
			if ($scope.newComment !== '') {
				Resource.postComment($scope.resource._id, {content: $scope.newComment}).success(function(res) {
					$scope.newComment = '';
					$scope.resource = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
		};

		$scope.deleteComment = function(cmid) {
			Resource.deleteComment($scope.resource._id, cmid).success(function(res) {
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
	})

	.controller('ItemInfoController', function($scope, $window, $location, $routeParams, $route, Item) {
		$scope.$location = $location;
		$scope.$route = $route;
		$scope.editing = false;
		$scope.bought = false;
		$scope.edit = {};
		$scope.uid = $window.localStorage['uid'];
		if ($window.localStorage['admin'] === 'true') {
			$scope.admin = true;
		} else {
			$scope.admin = false;
		}

		var itemID = $routeParams.id;

		Item.getOne(itemID).success(function(res) {
			$scope.success = true;
			$scope.item = res;
			for (var i = 0; i < $scope.item.buyers.length; i++) {
				if ($scope.item.buyers[i] === $scope.uid) {
					$scope.bought = true;
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

		$scope.editItem = function() {
			$scope.edit.description = $scope.htmlVariable;
			if ($scope.edit.name !== undefined && $scope.edit.name !== '' && 
				$scope.edit.price !== undefined && $scope.edit.price !== '' &&
				$scope.edit.description !== undefined && $scope.edit.description !== '') {
				Item.edit(itemID, $scope.edit).success(function(res) {
					$scope.editing = false;
					$scope.edit = {};
					$scope.htmlVariable = '';
					$scope.item = res;
				}).error(function(res) {
					$scope.success = false;
					$scope.errorMessage = res.error;
				});
			}
			
		};

		$scope.buy = function() {
			Item.buy(itemID).success(function(res) {
				$scope.bought = true;
				$scope.item = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};

		$scope.transact = function() {
			Item.transact(itemID).success(function(res) {
				$scope.sold = true;
				$scope.item = res;
			}).error(function(res) {
				$scope.success = false;
				$scope.errorMessage = res.error;
			});
		};
	});