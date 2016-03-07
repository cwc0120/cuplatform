var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UserCred = mongoose.model('UserCred');

router.route
	.get(function(req, res) {
		res.render('register', {
			title: 'Register'
		});
	})

	.post('/')(function(req, res, next) {
		
	})