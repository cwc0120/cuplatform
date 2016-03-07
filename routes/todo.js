var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');

router.route('/')
	// show all tasks
	.get(function(req, res, next) {
		Todo.find({user_id: req.session.id}).exec(function (err, taskList) {
			if (err) return next(err);
			res.render('todo', {
				title: 'Task List Example',
				taskList: taskList
			});
			console.log('GET success!');
		});	
	})

	// add a new task
	.post(function(req, res, next) {
		new Todo({
			user_id: req.session.id,
			content: req.body.content
			}).save(function(err) {
				if (err) return next(err);
				console.log('POST success! Content: ' + req.body.content);
				res.redirect('/todo');
			});
	});

router.route('/:id')
	// update a task
	.put(function(req, res, next) {
		Todo.update(
		{user_id: req.session.id, _id: req.params.id}, 
		{$set: {content: req.body.content}},
		function (err) {
			if (err) return next(err);
			console.log('PUT success!');
			res.status(200).json({redirectTo: '/todo'});
		});
	})

	// delete a task
	.delete(function(req, res, next) {
		Todo.remove(
		{user_id: req.session.id, _id: req.params.id},
		function(err) {
			if (err) return next(err);
			console.log('DELETE success!');
			res.status(200).json({redirectTo: '/todo'});
		});
	});

module.exports = router;