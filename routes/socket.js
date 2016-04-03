'use strict';
var utils = require('../utils');

var client = (function() {
	var onlineList = [];
	var messages = [];

	var getList = function() {
		return onlineList;
	};

	var getMessages = function() {
		return messages;
	};

	var newClient = function(uid, socket) {
		onlineList.push({
			uid: uid,
			id: socket.id
		});
	};

	var free = function(uid) {
		for (var i = 0; i < onlineList.length; i++) {
			if (onlineList[i].uid === uid) {
				onlineList.splice(i, 1);
				break;
			}
		}
	};

	var newMessage = function(uid, data) {
		messages.push({
			uid: uid,
			content: data
		});
	};

	var existClient = function(uid) {
		for (var i = 0; i < onlineList.length; i++) {
			if (uid === onlineList[i].uid) {
				return i;
			}
		}
		return false;
	};

	return {
		getList: getList,
		getMessages: getMessages,
		newClient: newClient,
		free: free,
		newMessage: newMessage,
		existClient: existClient
	};
}());

module.exports = function (socket) {
	var user = {};

	socket.on('auth', function(data) {
		utils.findUser(data.token, function(err, res) {
			if (err) {
				console.log('Not a User!');
			} else {
				if (client.existClient(res) !== false) {
					client.free(res);
					client.newClient(res, socket);
					user.uid = res;
				} else {
					client.newClient(res, socket);
					user.uid = res;
				}
				socket.broadcast.emit('clientList', client.getList());
				socket.emit('clientList', client.getList());
				socket.broadcast.emit('messageList', client.getMessages());
				socket.emit('messageList', client.getMessages());
			}
		});
	});

	socket.on('message', function(msg) {
		client.newMessage(user.uid, msg);
		socket.broadcast.emit('messageList', client.getMessages());
		socket.emit('messageList', client.getMessages());
	});

	socket.on('disconnect', function() {
		client.free(user.uid);
		socket.broadcast.emit('clientList', client.getList());
		socket.emit('clientList', client.getList());
	});
};
/*// notify other clients that a new user has joined
socket.broadcast.emit('user:join', {
name: name
});

// broadcast a user's message to other users
socket.on('send:message', function (data) {
socket.broadcast.emit('send:message', {
user: name,
text: data.message
});
});

// validate a user's name change, and broadcast it on success
socket.on('change:name', function (data, fn) {
if (userNames.claim(data.name)) {
var oldName = name;
userNames.free(oldName);

name = data.name;

socket.broadcast.emit('change:name', {
oldName: oldName,
newName: name
});

fn(true);
} else {
fn(false);
}
});

// clean up when a user leaves, and broadcast it to other users
socket.on('disconnect', function () {
socket.broadcast.emit('user:left', {
name: name
});
userNames.free(name);
});
};*/