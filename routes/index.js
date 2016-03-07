"use strict";
var express = require('express');
var router = express.Router();

router.route('/')
	.get(function(req, res) {
		res.render('index', {
			title: 'CU Platform'
		});
		console.log('GET success!');
	});

router.route('/register')
	.get(function(req, res) {
		res.render('register', {
			title: 'Register'
		});
	});

module.exports = router;
