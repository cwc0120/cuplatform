"use strict";
var express = require('express');
var crypto = require('crypto');
var mongoose = require('mongoose');
var router = express.Router();
var UserCred = mongoose.model('UserCred');

router.route('/')
	.get(function(req, res) {
		res.render('register', {
			title: 'Register'
		});
	})

	.post(function(req, res, next) {
		var uid = req.body.uid;
		var email = req.body.email;
		var pwd1 = req.body.pwd1;
		var pwd2 = req.body.pwd2;

		var alphanum = new RegExp('^[a-zA-Z0-9]*$');
		var cuemail = new RegExp('@link.cuhk.edu.hk');

		if (pwd1 != pwd2) {
			return res.status(400).send('Password should be consistent.');
		}
		if (!alphanum.test(pwd1)) {
			return res.status(400).send('Password should be alphanumeric.');
		}
		if (!alphanum.test(uid)) {
			return res.status(400).send('User ID should be alphanumeric.');
		}
		if (pwd1.length < 8) {
			return res.status(400).send('Password should be longer than 7 characters');
		}
		if (!cuemail.test(email)) {
			return res.status(400).send('CUHK email should be provided.');
		}

		UserCred.findOne({$or: [{uid: uid}, {email:email}]}, function(err, result) {
			if (err) return next(err);
			if (result != null) {
				return res.status(400).send('User ID or email has been used.');
			} else {
				var salt = crypto.randomBytes(128).toString('base64');
				var hash = crypto.pbkdf2Sync(pwd1, salt, 10000, 512, 'sha512');
				new UserCred({
					uid: uid,
					email: email,
					salt: salt,
					hash: hash
				}).save(function(err) {
					if (err) return next(err);
					res.redirect('/todo');
				});
			}
		})
	})

module.exports = router;