'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Resource = require('./resource');

var Course = new Schema({
	courseCode: {type: String, unique: true, required: true},
	courseName: String,
	deptCode: {type: String, ref: 'Dept', required: true},
	term: String,
	schedule: [{
		day: Number,
		time: Number,
		venue: String 
	}],
	prof: String,
	info: [{
		author: {type: String, ref: 'User'},
		rating: Number,
		outline: String,
		assessMethod: String,
		comment: String,
		dateOfComment: Date
	}]
});

Course.pre('remove', function(next) {
	Resource.remove({courseCode: this.courseCode}, function(err) {
		if (err) {
			return next(err);
		} else {
			console.log("Relative resources deleted.");
		}
	});
	next();
});


module.exports = mongoose.model('Course', Course);