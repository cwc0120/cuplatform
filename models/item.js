'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Item = new Schema({
	deptCode: {type: String, ref: 'Dept'},
	courseCode: {type: String, ref: 'Course'},
	name: String,
	description: String,
	seller: {type: String, ref: 'User'},
	buyers: [{type: String, ref: 'User'}],
	date: Date,
	price: Number,
	priceflexible: Boolean,
	sold: Boolean
});

module.exports = mongoose.model('Item', Item);