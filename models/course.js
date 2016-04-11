'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Thread = require('./thread');

var Course = new Schema({
	courseCode: {type: String, unique: true, required: true},
	courseName: String,
	deptCode: {type: String, ref: 'Dept', required: true},
	schedule: [{
		day: Number,
		time: Number,
		venue: String
	}],
	cred: Number,
	prof: String,
	info: [{
		author: {type: String, ref: 'User'},
		icon: String,
		rating: Number,
		outline: String,
		assessMethod: String,
		comment: String,
		dateOfComment: Date
	}],
	students: [{type: String, ref: 'User'}]
});

Course.pre('remove', function(next) {
	Thread.remove({courseCode: this.courseCode}, function(err) {
		if (err) {
			return next(err);
		} else {
			console.log("Relative threads deleted.");
		}
	});
	next();
});


module.exports = mongoose.model('Course', Course);