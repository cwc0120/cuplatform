'use strict';
ctrl.controller('messengerController', function($scope, $window, Socket, Auth, User) {
	$scope.uid = $window.localStorage['uid'];
	$scope.success = true;

	Socket.emit('auth', {
		token: Auth.getToken()
	});

	Socket.on('clientList', function(clients) {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].uid === $scope.uid) {
				clients.splice(i, 1);
			}
		}
		$scope.clients = clients;
		console.log(clients);
		$scope.offline = true;
		if ($scope.selected !== '') {
			for (var j = 0; j < $scope.clients.length; j++) {
				if ($scope.selected === $scope.clients[j].uid) {
					$scope.offline = false;
				}
			}
		}
	});

	Socket.on('pastName', function(list) {
		$scope.pastList = list;
	});

	Socket.on('chatRecord', function(chat) {
		$scope.chat = chat;
		if ($scope.chat.messages === undefined) {
			$scope.chat.messages = [];
		}
		if (!$scope.reversed){
			$scope.chat.messages.reverse();
			$scope.reversed = true;
		}
		$scope.offline = true;
		for (var i = 0; i < $scope.clients.length; i++) {
			if ($scope.selected === $scope.clients[i].uid) {
				$scope.offline = false;
			}
		}
	});

	Socket.on('newMessage', function(msg) {
		if (msg.sender === $scope.uid || msg.sender === $scope.selected) {
			$scope.chat.messages.splice(0, 0, msg);
		}
	});

	$scope.back = function() {
		window.history.back();
	};

	$scope.getChatRecord = function(uid) {
		$scope.searchError = '';
		$scope.reversed = false;
		$scope.selected = uid;
		Socket.emit('getChatRecord', {uid: uid});
	};

	$scope.newMessage = function() {
		Socket.emit('sendNewMessage', {
			recipient: $scope.selected,
			content: $scope.message
		});
		$scope.message = '';
		$scope.chat.error = '';
	};

	$scope.searchUser = function() {
		User.find($scope.newUser).success(function(res) {
			$scope.searchError = '';
			$scope.newUser = '';
			$scope.selected = res.uid;
			Socket.emit('getChatRecord', {uid: res.uid});
		}).error(function(res) {
			$scope.searchError = res.error;
		});
	};
});