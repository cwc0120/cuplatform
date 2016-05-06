'use strict';

// Module: Messenger
// Purpose: 
// 	This module is used to provide functionality of messenger
// Interface (from user):
// 	$scope.back: return to previous page if error occurs
// 	$scope.getChatRecord: get chat record of the recipient
// 	$scope.newMessage: send a message to the recipient
// 	$scope.searchUser: find an user and get the chat record

ctrl.controller('messengerController', function($scope, $window, Socket, Auth, User) {
	// Variables
	$scope.uid = $window.localStorage['uid'];
	$scope.success = true;

	// check the user if he is logged in
	Socket.emit('auth', {
		token: Auth.getToken()
	});

	// receive online user list from server:
	// first delete the current user id to avoid talking to himself
	// then check the selected user if he is online
	// if offline, remind the user
	Socket.on('clientList', function(clients) {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].uid === $scope.uid) {
				clients.splice(i, 1);
			}
		}
		$scope.clients = clients;
		$scope.offline = true;
		if ($scope.selected !== '') {
			for (var j = 0; j < $scope.clients.length; j++) {
				if ($scope.selected === $scope.clients[j].uid) {
					$scope.offline = false;
				}
			}
		}
	});

	// receive past chat user list from server:
	// the user list will be displayed on the webpage (messenger.html)
	Socket.on('pastName', function(list) {
		$scope.pastList = list;
	});

	// receive chat record from server
	// reverse the order of the record first to make it in reverse 
	// chronological order
	// then check recipient if he is online. If not, remind the user
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

	// receive newmessage from recipient
	// upadte the chat record on the webpage (messenger.html)
	Socket.on('newMessage', function(msg) {
		if (msg.sender === $scope.uid || msg.sender === $scope.selected) {
			$scope.chat.messages.splice(0, 0, msg);
		}
	});


	//--------------------------------------------------------------------------
	// Name: $scope.back
	// Purpose: return to previous page if error occurs
	$scope.back = function() {
		window.history.back();
	};

	//--------------------------------------------------------------------------
	// Name: $scope.getChatRecord
	// Purpose: get chat record of the recipient
	// Input: recipient's user id
	// Output: none
	// Implementation:
	// 	select the user
	// 	send 'getChatRecord' to server and wait 'chatRecord' from server
	$scope.getChatRecord = function(uid) {
		$scope.searchError = '';
		$scope.reversed = false;
		$scope.selected = uid;
		Socket.emit('getChatRecord', {uid: uid});
	};

	//--------------------------------------------------------------------------
	// Name: $scope.newMessage
	// Purpose: send a message to the recipient
	// Input: recipient's user id, message content
	// Output: none
	// Implementation:
	// 	send 'getNew Message' to server and wait 'newMessage' from server
	// 	clear the message textfield
	$scope.newMessage = function() {
		Socket.emit('sendNewMessage', {
			recipient: $scope.selected,
			content: $scope.message
		});
		$scope.message = '';
		$scope.chat.error = '';
	};

	//--------------------------------------------------------------------------
	// Name: $scope.searchUser
	// Purpose: send a message to the recipient
	// Input: recipient's user id
	// Output: none
	// Implementation:
	// 	select the user
	// 	send 'getChatRecord' to server and wait 'chatRecord' from server
	// 	empty the user textfield
	$scope.searchUser = function() {
		if ($scope.newUser !== $scope.uid) {
			User.find($scope.newUser).success(function(res) {
				$scope.searchError = '';
				$scope.newUser = '';
				$scope.selected = res.uid;
				Socket.emit('getChatRecord', {uid: res.uid});
			}).error(function(res) {
				$scope.searchError = res.error;
			});
		}
	};
});