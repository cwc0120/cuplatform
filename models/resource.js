'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Resource = new Schema({
	deptID: {type: Schema.Types.ObjectId, ref: 'Dept'},
	courseID: {type: Schema.Types.ObjectId, ref: 'Course'},
	name: String,
	description: String,
	uploader: {type: Schema.Types.ObjectId, ref: 'User'},
	link: Schema.Types.ObjectId,
	date: Date
});

module.exports = mongoose.model('Resource', Resource);