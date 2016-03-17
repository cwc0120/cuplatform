var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	uid: {type: String, required: true},
	email: {type: String, required: true},
	salt: {type: String, required: true},
	hash: {type: String, required: true},
	alias: String,
	icon: Schema.Types.ObjectId,
	gender: String,
	major: String,
	intro: String,
	points: Number,
	admin: Boolean
});

module.exports = mongoose.model('User', User);