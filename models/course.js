'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var Resource = require('./resource');

var Course = new Schema({
	courseCode: {type: String, unique: true, required: true},
	courseName: String,
	deptCode: {type: String, ref: 'Dept', required: true},
	term: String,
	schedule: [{
		day: Number,
		lesson: Number,
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
	resources: [{
		resourceID: {type: Schema.Types.ObjectId, ref: 'Resource'},
	}]
});

module.exports = mongoose.model('Course', Course);