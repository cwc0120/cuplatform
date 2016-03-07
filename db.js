var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Todo = new Schema({
	user_id: {type: String, required: true},
	content: String
});

var UserCred = new Schema({
	uid: {type: String, required: true},
	email: {type: String, required: true},
	salt: {type: String, required: true},
	hash: {type: String, required: true}
});

mongoose.model('Todo', Todo);
mongoose.model('UserCred', UserCred);
mongoose.connect('mongodb://localhost/cup-todo');