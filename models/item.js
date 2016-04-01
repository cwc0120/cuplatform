'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Item = new Schema({
	deptCode: {type: String, ref: 'Dept'},
	courseCode: {type: String, ref: 'Course'},
	name: String,
	description: String,
	img: String,
	seller: {type: String, ref: 'User'},
	// modify
	buyers: [{type: String, ref: 'User'}],
	date: Date,
	price: Number,
	priceFlexible: Boolean,
	sold: Boolean
});

module.exports = mongoose.model('Item', Item);