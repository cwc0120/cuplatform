'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Update is a model that shows update messages to the user.
//
// An update message has a recipient (the uid) and an update message

var Update = new Schema({
	uid: String,
	updates: [{
		topic: String,
		content: String,
		date: Date
	}]
});

module.exports = mongoose.model('Update', Update);