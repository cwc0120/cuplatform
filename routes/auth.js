'use strict';

// Module: auth
// Purpose:
//    This module is used to facilitate the communication between the server and
//    the database regarding the authentication process. Different methods
//    are provided for the clients.
// Routes:
//    /api/auth/
//       post: allow user to login
//       put: refreshing token after making amendments on the user 

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var async = require('async');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var Course = require('../models/course');

router.route('/')
	.post(function(req, res, next) {
		// allow user to login
		// take input for uid and password from user
		var uid = req.body.uid;
		var pwd = req.body.pwd;
		// find the corresponding user from the uid
		User.findOne({uid: uid}, function (err, user) {
			if (err) {
				return next(err);
			} else if (user === null) {
				// raise error if the uid provided doesn't exist
				res.status(400).json({error: 'User not found'});
			} else {
				// get the salt of the user if uid exist
				var salt = user.salt;
				// calculate the hash value from the salt and the password provided
				var hash = crypto.pbkdf2Sync(pwd, salt, 10000, 512);
				if (hash != user.hash) {
					// raise error if the hash value doesn't match
					res.status(400).json({error: 'Incorrect password'});
				} else {
					// user id is found and password is right, find the courses that the user is taking
					var coursesTaken = [];
					async.each(user.coursesTaken, function(courseID, callback) {
						Course.findOne({_id: courseID}, function(err, course) {
							if (err) {
								callback(err);
							} else {
								coursesTaken.push(course.courseCode);
								callback();
							}
						});
					}, function(err) {
						if (err) {
							return next(err);
						} else {
							// create token for user, which expire in 4 hours
							var token = jwt.sign({
								uid: user.uid,
								icon: user.icon,
								admin: user.admin,
								coursesTaken: coursesTaken
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
					});
				}
			}
		});
	})

	.put(function(req, res, next) {
		// refreshing the token after making some amendments on the user profile, basically the same as above except no password validation
		var uid = req.body.uid;
		// find the corresponding user from the uid
		User.findOne({uid: uid}, function (err, user) {
			if (err) {
				return next(err);
			} else if (user === null) {
				// raise error if user cannot be found
				res.status(400).json({error: 'User not found'});
			} else {
				// user id is found, find the courses that the user is taking
				var coursesTaken = [];
				async.each(user.coursesTaken, function(courseID, callback) {
					Course.findOne({_id: courseID}, function(err, course) {
						if (err) {
							callback(err);
						} else {
							coursesTaken.push(course.courseCode);
							callback();
						}
					});
				}, function(err) {
					if (err) {
						return next(err);
					} else {
						// create token for user, which expire in 4 hours
						var token = jwt.sign({
							uid: user.uid,
							icon: user.icon,
							admin: user.admin,
							coursesTaken: coursesTaken
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
				});
			}
		});
	});

module.exports = router;