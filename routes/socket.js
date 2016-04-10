'use strict';
var utils = require('../utils');
var Chat = require('../models/chat');

var chatroom = (function() {
	var onlineList = {};

	var getList = function() {
		var list = [];
		for (var key in onlineList) {
			if (onlineList.hasOwnProperty(key)) {
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

	var getMessages = function(user1, user2, callback) {
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
				callback({error: 'Error occurred.'});
			} else if (!chat) {
				callback({error: 'Empty record. Want to chat?'});
			} else {
				callback(chat);
			}
		});
	};

	var getPastName = function(user, callback) {
		Chat.find({$or:
			[{
				user1: user
			}, {
				user2: user
			}]
		}, function(err, chat) {
			if (err) {
				callback({error: 'Error occurred.'});
			} else {
				var list = [];
				for (var i = 0; i < chat.length; i++) {
					if (chat[i].user1 === user) {
						list.push(chat[i].user2);
					} else {
						list.push(chat[i].user1);
					}
				}
				callback(list);
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
				callback({error: 'Error occurred.'});
			} else if (!chat) {
				Chat.create({
					user1: sender,
					user2: recipient,
					messages:[{
						sender: sender,
						content: content,
						date: Date.now()
					}]
				}, function(err) {
					if (!err) {
						callback();
					}
				});
			} else {
				chat.update({$push: {messages: {
					sender: sender,
					content: content,
					date: Date.now()
				}}}, function(err) {
					if (!err) {
						callback();
					}
				});
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

	var replaceClient = function(uid, socket) {
		onlineList[uid] = socket.id;
	};

	return {
		getList: getList,
		getID: getID,
		getMessages: getMessages,
		getPastName: getPastName,
		newMessage: newMessage,
		newClient: newClient,
		freeClient: freeClient,
		existClient: existClient,
		replaceClient: replaceClient
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
						chatroom.replaceClient(res, socket);
					} else {
						chatroom.newClient(res, socket);
					}
					user.uid = res;
					io.emit('clientList', chatroom.getList());
					chatroom.getPastName(user.uid, function(res) {
						socket.emit('pastName', res);
					});
				}
			});
		});

		socket.on('getChatRecord', function(data) {
			chatroom.getMessages(user.uid, data.uid, function(res) {
				socket.emit('chatRecord', res);
			});
		});

		socket.on('getPastName', function() {
			chatroom.getPastName(user.uid, function(res) {
				socket.emit('pastName', res);
			});
		});

		socket.on('sendNewMessage', function(msg) {
			chatroom.newMessage(user.uid, msg.recipient, msg.content, function() {
				if (chatroom.existClient(msg.recipient)) {
					io.to(chatroom.getID(msg.recipient)).emit('newMessage', {
						sender: user.uid,
						content: msg.content,
						date: Date.now()
					});
				}
				socket.emit('newMessage', {
					sender: user.uid,
					content: msg.content,
					date: Date.now()
				});
			});
		});

		socket.on('disconnect', function() {
			chatroom.freeClient(user.uid);
			io.emit('clientList', chatroom.getList());
		});
	});	
};