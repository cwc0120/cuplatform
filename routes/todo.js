"use strict";
var express = require('express');
var router = express.Router();
var Todo = require('../models/todo');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		find(req, res, next);
	})

	.post(function(req, res, next) {
		Todo.create({
			user: req.decoded._doc.uid,
			content: req.body.content
		}, function(err) {
			if (err) {
				return next(err);
			} else {
				find(req, res, next);
			}
		});
	});

router.route('/:id')
	.put(function(req, res, next) {
		Todo.update(
			{_id: req.params.id, user: req.decoded._doc.uid}, 
			{$set: {content: req.body.content}
		}, function (err) {
			if (err) {
				return next(err);
			} else {
				find(req, res, next);
			}
		});
	})

	.delete(function(req, res, next) {
		Todo.remove(
			{_id: req.params.id, user: req.decoded._doc.uid},
			function(err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			}
		);
	});

function find(req, res, next) {
	Todo.find().exec(function (err, todos) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(todos);
		}
	});	
}

module.exports = router;