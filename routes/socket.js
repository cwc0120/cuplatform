'use strict';
var utils = require('../utils');
var Chat = require('../models/chat');

var chatroom = (function() {
	var onlineList = {};
	// get a list of online user
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

	// get the ID of the socket given a uid
	var getID = function(uid) {
		return onlineList[uid];
	};

	// get message between 2 users
	var getMessages = function(user1, user2, callback) {
		// get the chat records between user1 and user2
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
				// raise error if no chat record
				callback({error: 'Empty record. Want to chat?'});
			} else {
				// return chat record
				callback(chat);
			}
		});
	};

	// get a list of user that a user has previously chatted with
	var getPastName = function(user, callback) {
		// find a list of chat records of that user
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
				// add all users that the user has chatted with into an array
				var list = [];
				// use for loop to iterate all chat records
				for (var i = 0; i < chat.length; i++) {
					if (chat[i].user1 === user) {
						list.push(chat[i].user2);
					} else {
						list.push(chat[i].user1);
					}
				}
				// return the list of users
				callback(list);
			}
		});
	};

	// send a message from a sender to a recipient
	var newMessage = function(sender, recipient, icon, content, callback) {
		// find any chat records between the sender and the recipient
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
				// if no record can be found, create a new chat between them and send the message from the sender to the recipient
				Chat.create({
					user1: sender,
					user2: recipient,
					messages:[{
						sender: sender,
						icon: icon,
						content: content,
						date: Date.now()
					}]
				}, function(err) {
					if (!err) {
						callback();
					}
				});
			} else {
				// if previous record can be found, push the message to the chat
				chat.update({$push: {messages: {
					sender: sender,
					icon: icon,
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

	// assign a user with a socket
	var newClient = function(uid, socket) {
		onlineList[uid] = socket.id;
	};

	// remove a user from the online lsit
	var freeClient = function(uid) {
		delete onlineList[uid];
	};

	// check if the user is in the online list, return true if yes
	var existClient = function(uid) {
		if (onlineList[uid] !== undefined) {
			return true;
		}
		return false;
	};

	// replace a new socket for the user
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
			// let user establish a socket
			// check if the user has a token
			utils.findUser(data.token, function(err, res) {
				if (err) {
					console.log('Not a User!');
				} else {
					// check if the user is currently online
					if (chatroom.existClient(res.uid) !== false) {
						// replace the user with a new socket if the user is online
						chatroom.replaceClient(res.uid, socket);
					} else {
						// assign user with a socket if he is new
						chatroom.newClient(res.uid, socket);
					}
					// assign the user with his uid and icon
					user.uid = res.uid;
					user.icon = res.icon;
					// get the list of online user
					io.emit('clientList', chatroom.getList());
					// get the list of user that the user has previously chatted with
					chatroom.getPastName(user.uid, function(res) {
						socket.emit('pastName', res);
					});
				}
			});
		});

		// get the previous chat records of the user
		socket.on('getChatRecord', function(data) {
			chatroom.getMessages(user.uid, data.uid, function(res) {
				socket.emit('chatRecord', res);
			});
		});

		// get the list of users that the user has previously chatted with
		socket.on('getPastName', function() {
			chatroom.getPastName(user.uid, function(res) {
				socket.emit('pastName', res);
			});
		});

		// send a new message from the user
		socket.on('sendNewMessage', function(msg) {
			// create a new message and send to the recipient
			chatroom.newMessage(user.uid, msg.recipient, user.icon, msg.content, function() {
				// check if the recipient is online
				if (chatroom.existClient(msg.recipient)) {
					// send message immediately through io if the recipient is online
					io.to(chatroom.getID(msg.recipient)).emit('newMessage', {
						sender: user.uid,
						icon: user.icon,
						content: msg.content,
						date: Date.now()
					});
				}
				// use socket to send message if recipient is not online
				socket.emit('newMessage', {
					sender: user.uid,
					icon: user.icon,
					content: msg.content,
					date: Date.now()
				});
			});
		});

		// remove user from online list when he disconnect
		socket.on('disconnect', function() {
			chatroom.freeClient(user.uid);
			user = {};
			io.emit('clientList', chatroom.getList());
		});
	});	
};