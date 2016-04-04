'use strict';
ctrl.controller('messengerController', function($scope, $window, Socket, Auth) {
	$scope.uid = $window.localStorage['uid'];

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

	Socket.on('chatRecord', function(chat) {
		$scope.chat = chat;
	});

	Socket.on('msgArrived', function(msg) {
		$scope.chat.messages.push(msg);
	});

	$scope.back = function() {
		window.history.back();
	};

	$scope.getChatRecord = function(uid) {
		$scope.selected = uid;
		Socket.emit('getChatRecord', {uid: uid});
	};

	$scope.newMessage = function() {
		Socket.emit('newMessage', {
			recipient: $scope.selected,
			content: $scope.message
		});
		$scope.message = '';
	};

	// socket.on('send:message', function(message) {
	// 	$scope.messages.push(message);
	// });

	// socket.on('user:join', function(data) {
	// 	$scope.messages.push({
	// 		user: 'chatroom',
	// 		text: 'User ' + data.name + ' has joined.'
	// 	});
	// 	$scope.users.push(data.name);
	// });

	// socket.on('user:left', function(data) {
	// 	$scope.messages.push({
	// 		user: 'chatroom',
	// 		test: 'User ' + data.name + ' has left.'
	// 	});
	// 	var i, user;
	// 	for (i = 0; i < $scope.users.length ; i++) {
	// 		user = $scope.user[i];
	// 		if (user === data.name) {
	// 			$scope.users.splice(1, i);
	// 			break;
	// 		}
	// 	}
	// });

	// $scope.sendMessage = function() {
	// 	socket.emit('send:message', {
	// 		message: $scope.message
	// 	});

	// 	$scope.messages.push({
	// 		user: $scope.name,
	// 		text: $scope.message
	// 	});

	// 	$scope.message = '';
	// };
});