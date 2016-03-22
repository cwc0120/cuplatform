'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Item = new Schema({
	deptCode: {type: String, ref: 'Dept'},
	courseCode: {type: String, ref: 'Course'},
	name: String,
	description: String,
	seller: {type: Schema.Types.ObjectId, ref: 'User'},
	date: Date,
	price: Number,
	priceflexible: Boolean,
	quantity: Number
});

module.exports = mongoose.model('Item', Item);