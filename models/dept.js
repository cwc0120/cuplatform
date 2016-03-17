'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Course = require('./course');
var Resource = require('./resource');

var Dept = new Schema({
	deptCode: {type: String, unique: true, required: true},
	deptName: String
});

Dept.pre('remove', function(next) {
	Course.remove({deptCode: this.deptCode}, function(err) {
		if (err) {
			return next(err);
		} else {
			console.log("Relative courses deleted.");
		}
	});
	Resource.remove({deptCode: this.deptCode}, function(err) {
		if (err) {
			return next(err);
		} else {
			console.log("Relative resources deleted.");
		}
	});
	next();
});

module.exports = mongoose.model('Dept', Dept);