"use strict";
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var UserCred = require('../models/usercred');

router.post('/', function(req, res, next) {
	var uid = req.body.uid;
	var email = req.body.email;
	var pwd1 = req.body.pwd1;

	UserCred.findOne({$or: [{uid: uid}, {email:email}]}, function(err, result) {
		if (err) {
			return next(err);
		} else if (result !== null) {
			res.status(400).json({error: 'User ID or email has been used.'});
		} else {
			var salt = crypto.randomBytes(128).toString('base64');
			var hash = crypto.pbkdf2Sync(pwd1, salt, 10000, 512);
			UserCred.create({
				uid: uid,
				email: email,
				salt: salt,
				hash: hash
			}, function(err) {
				if (err) {
					return next(err);
				} else {
					res.status(200).json({redirect: '/task'});
				}		
			});
		}
	});
});

module.exports = router;