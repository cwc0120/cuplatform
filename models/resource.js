'use strict';
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;

// Resource is a model showing all resources uploaded.
//
// A recourse is under a course and has its name, description, uploader, 
// uploader's icon link, link, date of upload and an array of comments.

var Resource = new Schema({
	courseCode: String,
	name: String,
	description: String,
	uploader: String,
	icon: String,
	link: String,
	dateOfUpload: Date,
	comment: [{
		author: String,
		icon: String,
		content: String,
		dateOfComment: Date
	}]
});

// When a resource is removed, remove the file from the database
Resource.pre('remove', function(next) {
	var	fileName = this.link;
	// find and remove the file with the file name
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