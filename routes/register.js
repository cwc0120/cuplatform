"use strict";

// Module: register
// Purpose:
//    This module is used to facilitate the communication between the server and
//    the database regarding the information about registration. Different methods
//    are provided for the clients.
// Routes:
//    /api/register/
//       post: create an account the a new user

var express = require('express');
var multer = require('multer');
var crypto = require('crypto');
var router = express.Router();
var User = require('../models/user');

// upload user icon
var storage = multer.diskStorage({
	// set destination of the icon as the user folder
	destination: function (req, file, cb) {
		cb(null, './public/images/user/');
	},
	// rename the file
	filename: function (req, file, cb) {
		var originalName = file.originalname;
		var ext = originalName.split('.');
		cb(null, Date.now() + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	storage: storage,
	// check the type of the file
	fileFilter: function(req, file, cb) {
		if (file.mimetype.slice(0,5) === 'image') {
			cb(null, true);
		} else {
			// raise error if the file is not an image
			cb(new Error('Not an image file!'));
		}	
	},
	// set limit to the size of the file
	limits: {fileSize: 1048576}
});

// Purpose: Create an account for a new user
// Input:
//    uid: User ID, must be alphanumeric
//    email: CUHK link email
//    pwd1: User password, must be alphanumeric
//    pwd2: Password confirmation
// Output:
//    none
// Implementation:
//    First check if an user icon is uploaded, if pwd1 and pwd are consistent and 
//    if the email is a CUHK email. Then, find if there is no user with the same
//    uid and email in the database. After that, generate a salt and calculate
//    the hash. Create a new user using the details.

router.route('/')
	.post(upload.single('img'), function(req, res, next) {
		// open an account
		// set variable using the user's input
		var uid = req.body.uid;
		var email = req.body.email;
		var pwd1 = req.body.pwd1;
		var pwd2 = req.body.pwd2;

		var emailPattern = new RegExp(/@link.cuhk.edu.hk$/);
		// check if an image is uploaded, the password is retyped correctly and 
		// the email is a CUHK email
		if (!req.file) {
			// raise error if no image is uploaded
			res.status(400).json({error: 'No image uploaded.'});
		} else if (pwd1 !== pwd2) {
			// raise error if passwords are not matched
			res.status(400).json({error: 'Passwords unmatched.'});
		} else if (!email.match(emailPattern)) {
			// raise error if the email is not a CUHK email
			res.status(400).json({error: 'CUHK email required.'});
		} else {
			// find if there is any existing account using the email or uid provided
			User.findOne({$or: [{uid: uid}, {email: email}]}, function(err, result) {
				if (err) {
					return next(err);
				} else if (result !== null) {
					// if an account can be found, raise error
					res.status(400).json({error: 'User ID or email has been used.'});
				} else {
					// generate a salt and calculate the hash value
					var salt = crypto.randomBytes(128).toString('base64');
					var hash = crypto.pbkdf2Sync(pwd1, salt, 10000, 512);
					// create an user account
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