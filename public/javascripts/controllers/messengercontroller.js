'use strict';
ctrl.controller('messengerController', function($scope, $window, Socket, Auth) {
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
	});

	Socket.on('pastName', function(list) {
		$scope.pastList = list;
	});

	Socket.on('chatRecord', function(chat) {
		$scope.chat = chat;
		$scope.chat.messages.reverse();
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
		$scope.selected = uid;
		Socket.emit('getChatRecord', {uid: uid});
	};

	$scope.newMessage = function() {
		Socket.emit('sendNewMessage', {
			recipient: $scope.selected,
			content: $scope.message
		});
		$scope.message = '';
	};
});