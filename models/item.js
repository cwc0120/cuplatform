'use strict';
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;

// Item is a model for each item posted in the trading platform.
//
// An item has its category (which can be a department code, a course code or 
// "GENERAL"), name, description, image link, seller, seller's icon link, array 
// of interested buyer, date of posting, price, price, price flexibility (true 
// means flexible), status (sold and active).
//
// The interested buyer list is saved as an array of user id and user icon link.

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

// When an item is removed, remove the item's image from the database as well
Item.pre('remove', function(next) {
	var	fileName = this.img;
	// remove the file from the database
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