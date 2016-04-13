'use strict';
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;

var Item = new Schema({
	category: String,
	name: String,
	description: String,
	img: String,
	seller: String,
	icon: String,
	buyer: [{
		uid: String,
		icon: String
	}],
	date: Date,
	price: Number,
	priceFlexible: Boolean,
	sold: Boolean,
	active: Boolean
});

Item.pre('remove', function(next) {
	var	fileName = this.img;
	fs.unlink('./public/images/item/' + fileName, function(err) {
		if (err) {
			return next(err);
		} else {
			console.log("Relative files deleted.");
		}
	});
	next();
});

module.exports = mongoose.model('Item', Item);