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

router.get('/register', function(req, res) {
	res.render('register');
});


router.get('/task', function(req, res) {
	res.render('todo');
});

module.exports = router;