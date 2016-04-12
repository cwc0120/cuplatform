'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Chat = new Schema({
	user1: {type: String, ref: 'User'},
	user2: {type: String, ref: 'User'},
	messages: [{
		sender: {type: String, ref: 'User'},
		content: String,
		date: Date
	}]
});

module.exports = mongoose.model('Chat', Chat);