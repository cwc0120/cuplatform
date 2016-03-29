'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Resource = require('./resource');
var Item = require ('./item');
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
	prof: String,
	info: [{
		author: {type: String, ref: 'User'},
		rating: Number,
		outline: String,
		assessMethod: String,
		comment: String,
		dateOfComment: Date
	}],
	students: [{type: String, ref: 'User'}]
});

Course.pre('remove', function(next) {
	Resource.find({courseCode: this.courseCode}, function(err, resources) {
		if (err) {
			return next(err);
		} else {
			for (var i=0; i<resources.length; i++) {
				resources[i].remove();
			}
			console.log("Relative resources deleted.");
		}
	});
	Item.remove({courseCode: this.courseCode}, function(err) {
		if (err) {
			return next(err);
		} else {
			console.log("Relative items deleted.");
		}
	});
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