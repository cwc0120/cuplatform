'use strict';
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var User = require('../models/user');

router.post('/', function(req, res, next) {
	var uid = req.body.uid;
	var pwd = req.body.pwd;

	User.findOne({uid: uid}, function (err, user) {
		if (err) {
			return next(err);
		} else if (user === null) {
			res.status(400).json({error: 'User not found'});
		} else {
			var salt = user.salt;
			var hash = crypto.pbkdf2Sync(pwd, salt, 10000, 512);
			if (hash != user.hash) {
				res.status(400).json({error: 'Incorrect password'});
			} else {
				// user id is found and password is right, create a token
				var token = jwt.sign({
					uid: user.uid,
					icon: user.icon,
					admin: user.admin
				}, req.app.get('secret'), {
					expiresIn: 14400
				});

				// return token
				res.status(200).json({
					token: token,
					uid: user.uid,
					icon: user.icon,
					admin: user.admin,
					message: 'Login successful.'
				});
			}
		}
	});
});

module.exports = router;