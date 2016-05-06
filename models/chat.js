'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Chat is a model between two users that include all messages between them.
//
// Each message has its sender, sender's icon, content and date
//
// The sender and sender's icon are included in the message for the convenience 
// of outputing to the client.

var Chat = new Schema({
	user1: String,
	user2: String,
	messages: [{
		sender: String,
		icon: String,
		content: String,
		date: Date
	}]
});

module.exports = mongoose.model('Chat', Chat);