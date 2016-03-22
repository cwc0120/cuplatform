'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Course = require('./course');

var Dept = new Schema({
	deptCode: {type: String, unique: true, required: true},
	deptName: String
});

Dept.pre('remove', function(next) {
	Course.find({deptCode: this.deptCode}, function(err, courses) {
		if (err) {
			return next(err);
		} else {
			for (var i=0; i<courses.length; i++) {
				courses[i].remove();
			}
			console.log("Relative courses deleted.");
		}
	});
	next();
});

module.exports = mongoose.model('Dept', Dept);