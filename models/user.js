'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	uid: {type: String, required: true, unique: true},
	email: {type: String, required: true},
	salt: {type: String, required: true},
	hash: {type: String, required: true},
	icon: String,
	gender: String,
	birthday: Date,
	major: String,
	intro: String,
	points: Number,
	coursesTaken: [{type: String, ref: 'Course'}],
	admin: Boolean,
	updates: [{
		topic: String,
		content: String,
		date: Date
	}]
});

module.exports = mongoose.model('User', User);