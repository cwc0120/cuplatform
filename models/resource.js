'use strict';
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;

var Resource = new Schema({
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

Resource.pre('remove', function(next) {
	var	fileName = this.link;
	fs.unlink('./uploads/' + fileName, function(err) {
		if (err) {
			return next(err);
		} else {
			console.log("Relative files deleted.");
		}
	});
	next();
});

module.exports = mongoose.model('Resource', Resource);