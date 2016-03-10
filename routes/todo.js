"use strict";
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Todo = require('../models/todo');

router.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if (token) {
		jwt.verify(token, req.app.get('secret'), function(err, decoded) {
			if (err) {
				return res.status(400).json({message: 'Failed to authenticate token.'});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).json({message: 'No token provided.'});
	}
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
			{_id: req.params.id}, 
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
			{_id: req.params.id},
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