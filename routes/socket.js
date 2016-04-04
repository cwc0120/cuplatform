'use strict';
var utils = require('../utils');
var Chat = require('../models/chat');

var chatroom = (function() {
	var onlineList = {};

	var getList = function() {
		var list = [];
		for (var key in onlineList) {
			if (!onlineList.hasOwnProperty(key)) {
				list.push({
					uid: key,
					id: onlineList[key]
				});
			}		
		}
		return list;
	};

	var getID = function(uid) {
		return onlineList[uid];
	};

	var getMessages = function(user1, user2) {
		Chat.findOne({$or: 
			[{
				user1: user1, 
				user2: user2
			}, {
				user1: user2,
				user2: user1
			}]
		}, function(err, chat) {
			if (err) {
				return {error: 'Error occurred.'};
			} else {
				return chat;
			}
		});
	};

	var newMessage = function(sender, recipient, content, callback) {
		Chat.findOne({$or: 
			[{
				user1: sender, 
				user2: recipient
			}, {
				user1: recipient,
				user2: sender
			}]
		}, function(err, chat) {
			if (err) {
				return {error: 'Error occurred.'};
			} else if (!chat) {
				Chat.create({
					user1: sender,
					user2: recipient,
					messages:[{
						sender: 1,
						content: content,
						date: Date.now()
					}]
				}, function(err) {
					if (!err) {
						callback();
					}
				});
			} else {
				if (sender === chat.user1) {
					chat.update({$push: {
						sender: 1,
						content: content,
						date: Date.now()
					}}, function(err) {
						if (!err) {
							callback();
						}
					});
				} else {
					chat.update({$push: {
						sender: 2,
						content: content,
						date: Date.now()
						}}, function(err) {
						if (!err) {
							callback();
						}
					});
				}
			}
		});
	};

	var newClient = function(uid, socket) {
		onlineList[uid] = socket.id;
	};

	var freeClient = function(uid) {
		delete onlineList[uid];
	};

	var existClient = function(uid) {
		if (onlineList[uid] !== undefined) {
			return true;
		}
		return false;
	};

	return {
		getList: getList,
		getID: getID,
		getMessages: getMessages,
		newMessage: newMessage,
		newClient: newClient,
		freeClient: freeClient,
		existClient: existClient
	};
}());

module.exports = function (io) {
	io.on('connection', function(socket) {
		var user = {};

		socket.on('auth', function(data) {
			utils.findUser(data.token, function(err, res) {
				if (err) {
					console.log('Not a User!');
				} else {
					if (chatroom.existClient(res) !== false) {
						chatroom.freeClient(res);
						chatroom.newClient(res, socket);
						user.uid = res;
					} else {
						chatroom.newClient(res, socket);
						user.uid = res;
					}
					io.emit('clientList', chatroom.getList());
					io.emit('messageList', chatroom.getMessages());
				}
			});
		});

		socket.on('getChatRecord', function(target) {
			socket.emit('chatRecord', chatroom.getMessages(user.uid, target));
		});

		socket.on('newMessage', function(msg) {
			chatroom.newMessage(user.uid, msg.recipient, msg.content, function() {
				io.to(chatroom.getID(msg.recipient)).emit('message', msg.content);
			});
		});

		socket.on('disconnect', function() {
			chatroom.freeClient(user.uid);
			io.emit('clientList', chatroom.getList());
		});
	});	
};