'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// User is a model specifying the user details using the CUPlatform.
//
// An user has his user id, email, salt (for calculateing the hash), hash 
// value, icon link, gender, birthday, major, introduction, points, course 
// taken, admin authorization and array of update messages. 

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
	coursesTaken: [{type: Schema.Types.ObjectId, ref: 'Course'}],
	admin: Boolean,
	updates: [{
		topic: String,
		content: String,
		date: Date
	}]
});

module.exports = mongoose.model('User', User);