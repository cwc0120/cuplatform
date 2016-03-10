var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Todo = new Schema({
	user: String,
	content: String
});

module.exports = mongoose.model('Todo', Todo);