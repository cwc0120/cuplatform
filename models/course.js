'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Thread = require('./thread');

// Course is a model specifying each course available in CUHK in the semester.
//
// A course has course code, course name, department code, schedule, number of 
// credits, professor and info.
// 
// Schedule is represented with the day (monday to friday as 1 to 6), time 
// (0830 to 2115 as 13) and venue (initial of the place).
//
// Info is an array of comments from students taking the course

var Course = new Schema({
	courseCode: {type: String, unique: true, required: true},
	courseName: String,
	deptCode: String,
	schedule: [{
		day: Number,
		time: Number,
		venue: String
	}],
	cred: Number,
	prof: String,
	info: [{
		author: String,
		icon: String,
		rating: Number,
		outline: String,
		assessMethod: String,
		comment: String,
		dateOfComment: Date
	}],
});

// When a course is removed, the related threads will be deleted as well
Course.pre('remove', function(next) {
	// Find the threads from database with the course code and remove them
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