'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Course = require('./course');

// Department is a model specifying every department in CUHK.
// A department include a department code (4 characters) and a department name

var Dept = new Schema({
	deptCode: {type: String, unique: true, required: true},
	deptName: String
});

// When a department is deleted, find the courses under the department from the 
// database and remove them
Dept.pre('remove', function(next) {
	// find course under the department from database
	Course.find({deptCode: this.deptCode}, function(err, courses) {
		if (err) {
			return next(err);
		} else {
			// remove the found courses from database using for loop
			for (var i=0; i<courses.length; i++) {
				courses[i].remove();
			}
			console.log("Relative courses deleted.");
		}
	});
	next();
});

module.exports = mongoose.model('Dept', Dept);