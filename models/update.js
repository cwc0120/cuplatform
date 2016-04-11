'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Update = new Schema({
	uid: {type: String, ref: 'User'},
	updates: [{
		topic: String,
		content: String,
		date: Date
	}]
});

module.exports = mongoose.model('Update', Update);