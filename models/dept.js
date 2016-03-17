var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Dept = new Schema({
	deptCode: String,
	deptName: String,
	courses: [{
		courseID: {type: Schema.Types.ObjectId, ref: 'Course'},
	}],
	resourses: [{
		resourceID: {type: Schema.Types.ObjectId,, ref: 'Resource'},
	}]
});

module.exports = mongoose.model('Dept', Dept);