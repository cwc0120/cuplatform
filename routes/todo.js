"use strict";
var express = require('express'); 
var mongoose = require('mongoose');
var router = express.Router();
var Todo = mongoose.model('Todo');

router.route('/')
	// show all tasks
	.get(function(req, res, next) {
		find(req, res, next);
	})

	// add a new task
	.post(function(req, res, next) {
		var content = req.body.content;
		Todo.create({
			user_id: req.session.id,
			content: content
			}, 
			function(err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			});
	});

router.route('/:id')
	// update a task
	.put(function(req, res, next) {
		var content = req.body.content;
		Todo.update(
			{user_id: req.session.id, _id: req.params.id}, 
			{$set: {content: content}},
			function (err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			});
	})

	// delete a task
	.delete(function(req, res, next) {
		Todo.remove(
			{user_id: req.session.id, _id: req.params.id},
			function(err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			});
	});

function find(req, res, next) {
	Todo.find({user_id: req.session.id}).exec(function (err, todos) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(todos);
		}
	});	
}

module.exports = router;