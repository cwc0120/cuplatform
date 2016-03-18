'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Resource = new Schema({
	deptCode: {type: String, ref: 'Dept'},
	courseCode: {type: String, ref: 'Course'},
	name: String,
	description: String,
	uploader: {type: String, ref: 'User'},
	link: String,
	dateOfUpload: Date,
	comment: [{
		author: {type: String, ref: 'User'},
		content: String,
		dateOfComment: Date
	}]
});

module.exports = mongoose.model('Resource', Resource);