'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Thread = new Schema({
	courseCode: String,
	author: String,
	icon: String,
	annoymous: Boolean,
	topic: String,
	content: String,
	dateOfThread: Date,
	dateOfUpdate: Date,
	comment: [{
		author: String,
		icon: String,
		content: String,
		dateOfComment: Date
	}]
});

module.exports = mongoose.model('Thread', Thread);