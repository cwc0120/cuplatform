var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Todo = new Schema({
	user_id: {type: String, required: true},
	content: String
});

module.exports = mongoose.model('Todo', Todo);