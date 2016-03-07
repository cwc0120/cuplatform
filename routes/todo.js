"use strict";
var express = require('express'); 
var mongoose = require('mongoose');
var router = express.Router();
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
		var content = req.body.content;
		new Todo({
			user_id: req.session.id,
			content: content
			}).save(function(err) {
				if (err) return next(err);
				console.log('POST success! Content: ' + content);
				res.redirect('/todo');
			});
	})

router.route('/:id')
	// update a task
	.put(function(req, res, next) {
		var content = req.body.content;
		Todo.update(
		{user_id: req.session.id, _id: req.params.id}, 
		{$set: {content: content}},
		function (err) {
			if (err) return next(err);
			console.log('PUT success! Content: ' + content);
			res.status(200).json({redirectTo: '/todo'});
		});
	})

	// delete a task
	.delete(function(req, res, next) {
		Todo.remove(
		{user_id: req.session.id, _id: req.params.id},
		function(err) {
			if (err) return next(err);
			console.log('DELETE success! ID: ' + req.params.id);
			res.status(200).json({redirectTo: '/todo'});
		});
	})

module.exports = router;