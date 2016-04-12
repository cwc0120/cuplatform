'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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