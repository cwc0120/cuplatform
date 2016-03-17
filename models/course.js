var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Course = new Schema({
	courseCode: String,
	courseName: String,
	deptID: {type: Schema.Types.ObjectId, ref: 'Dept'},
	term: String,
	schedule: [{
		day: Number,
		lesson: Number,
		venue: String 
	}],
	prof: String,
	outline: String,
	assessMethod: String,
	comments: [{
		author: {type: Schema.Types.ObjectId, ref: 'User'},
		rating: Number,
		content: String,
		dateOfComment: Date
	}],
	resources: [{
		resourceID: {type: Schema.Types.ObjectId, ref: 'Resource'},
	}]
});

module.exports = mongoose.model('Course', Course);