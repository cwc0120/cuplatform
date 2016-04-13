"use strict";
var express = require('express');
var multer = require('multer');
var crypto = require('crypto');
var router = express.Router();
var User = require('../models/user');

// upload user icon
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/images/user/');
	},
	filename: function (req, file, cb) {
		var originalName = file.originalname;
		var ext = originalName.split('.');
		cb(null, Date.now() + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	storage: storage,
	fileFilter: function(req, file, cb) {
		if (file.mimetype.slice(0,5) === 'image') {
			cb(null, true);
		} else {
			cb(new Error('Not an image file!'));
		}	
	},
	limits: {fileSize: 1048576}
});

router.route('/')
	.post(upload.single('img'), function(req, res, next) {
		var uid = req.body.uid;
		var email = req.body.email;
		var pwd1 = req.body.pwd1;
		var pwd2 = req.body.pwd2;

		var emailPattern = new RegExp(/@link.cuhk.edu.hk$/);

		if (!req.file) {
			res.status(400).json({error: 'No image uploaded.'});
		} else if (pwd1 !== pwd2) {
			res.status(400).json({error: 'Passwords unmatched.'});
		} else if (!email.match(emailPattern)) {
			res.status(400).json({error: 'CUHK email required.'});
		} else {
			User.findOne({$or: [{uid: uid}, {email: email}]}, function(err, result) {
				if (err) {
					return next(err);
				} else if (result !== null) {
					res.status(400).json({error: 'User ID or email has been used.'});
				} else {
					var salt = crypto.randomBytes(128).toString('base64');
					var hash = crypto.pbkdf2Sync(pwd1, salt, 10000, 512);
					User.create({
						uid: uid,
						email: email,
						salt: salt,
						hash: hash,
						points: 0,
						icon: req.file.filename
					}, function(err) {
						if (err) {
							return next(err);
						} else {
							res.status(200).end();
						}		
					});
				}
			});	
		}
	});

module.exports = router;