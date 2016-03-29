'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Transaction = new Schema({
	seller: {type: String, ref: 'User'},
	buyer: {type: String, ref: 'User'},
	item: {type: Schema.Types.ObjectId, ref: 'Item'},
	status: String,
	// interested, transacted(success, failed), cancelled
	dateOfUpdate: Date
});

module.exports = mongoose.model('Transaction', Transaction);