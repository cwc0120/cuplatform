"use strict";
var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');

module.exports = function(app) {
	app.get('/api/todo', function(req, res, next) {
		find(req, res, next);
	});

	app.post('/api/todo', function(req, res, next) {
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

	app.put('/api/todo/:id', function(req, res, next) {
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
	});

	app.delete('/api/todo/:id', function(req, res, next) {
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

	app.get('/task', function(req, res) {
		res.render('todo');
	});
};

function find(req, res, next) {
	Todo.find({user_id: req.session.id}).exec(function (err, todos) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(todos);
		}
	});	
}