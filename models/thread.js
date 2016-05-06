'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Thread is a model specifying the threads in the discussion forum.
//
// A thread has its course code (either a course code or "GENERAL"), author, 
// author's icon, anonymous status, topic, content, date of open, date of update
// and an array of comment.

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