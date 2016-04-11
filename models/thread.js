'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Thread = new Schema({
	courseCode: {type: String, ref: 'Course'},
	author: {type: String, ref: 'User'},
	icon: String,
	annoymous: Boolean,
	topic: String,
	content: String,
	dateOfThread: Date,
	dateOfUpdate: Date,
	comment: [{
		author: {type: String, ref: 'User'},
		icon: String,
		content: String,
		dateOfComment: Date
	}]
});

module.exports = mongoose.model('Thread', Thread);