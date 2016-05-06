'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Transaction is a model specifying the transactions between buyer and seller 
// in the trading platform
//
// Each transaction has a seller, a buyer ,an item and date of update
//
// The status of the transaction can either be interested (buyer interested in 
// seller's item but not transacted), success (item traded between buyer and 
// seller), failed (seller sold to another buyer), cancelled (seller cancelled 
// the item).

var Transaction = new Schema({
	seller: String,
	buyer: String,
	item: {type: Schema.Types.ObjectId, ref: 'Item'},
	status: String,
	// interested, success, failed, cancelled
	dateOfUpdate: Date
});

module.exports = mongoose.model('Transaction', Transaction);