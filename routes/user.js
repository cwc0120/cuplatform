"use strict";
var express = require('express');
var multer = require('multer');
var router = express.Router();
var User = require('../models/user');
var utils = require('../utils');
var crypto = require('crypto');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

// upload user icon
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/images/user/');
	},
	filename: function (req, file, cb) {
		// use user name as file name
		var originalName = file.originalname;
		var ext = originalName.split('.');
		cb(null, req.decoded.uid + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	storage: storage,
	fileFilter: function(req, file, cb) {
		if (file.mimetype.slice(0,5) == 'image') {
			cb(null, true);
		} else {
			cb(new Error('Not an image file!'));
		}	
	},
	limits: {fileSize: 1048576}
});

router.route('/:id')
	// see the status of user 
	.get(function(req, res, next) {
		find(req,res,next);
	})

	// edit user information (except timetable)
	.put(function(req, res, next) {
		if (req.params.id === req.decoded.uid) {
			User.findOneAndUpdate({uid: req.params.id},{$set: {
				major: req.body.major,
				intro: req.body.intro,
				gender: req.body.gender
			}}, function(err){
				if(err){
					return next(err);
				} else {
					find(req,res,next);
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});


router.route('/icon')
	// get an icon of user (optional)
	.get(function(req, res, next) {
		findIcon(req, res, next);
	})

	// upload icon
	.post(upload.single('iconLink'),function(req, res, next) {
		if (!req.file) {
			res.status(400).json({error: 'No image uploaded.'});
		} else {
			User.find({uid: req.decoded.uid}, function(err, user) {
				if (err) {
					return next(err);
				} else {
					user.update({$set:{
						iconLink: req.file.filename
					}}, function(err){
						if (err) {
							return next (err);
						} else {
							findIcon(req, res, next);
						}
					});
				}
			});
		}});

router.router('/cred')
	// change password
	.put(function(req, res, next) {
		User.findOne({uid: req.params.uid}, function (err, user) {
		if (err) {
			return next(err);
		} else {
			var salt = user.salt;
			var hash = crypto.pbkdf2Sync(req.body.pwd, salt, 10000, 512);
			if (hash !== user.hash) {
				res.status(400).json({error: 'Incorrect password'});
			} else {
				hash = crypto.pbkdf2Sync(req.body.pwd1,salt, 10000, 512);
				user.update({$set:{
					hash: hash
				}}, function(err) {
					if(err){
						return next(err);
					} else {
						find(req,res,next);
					}
				});
			}}
		});
	});

router.route('/timetable/:id')
	// see a user's timetable
	.get(function(req, res, next) {
		// return a list of lessons
	})

	// edit user's timetable
	.put(function(req, res, next) {
		if (req.params.id === req.decoded.uid) {
			// update the user's timetable by $set
		} else {
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

function find(req, res, next){
	User.findOne({uid: req.params.id},function(err, user) {
			if(err){
				next(err);
			} else if (user === null){
				res.status(400).json({error: "User not found!"});
			} else {
				res.status (200).json(user);
			}
		});
	}
function findIcon(req, res, next){
	User.findOne({uid: req.decoded.uid})
		.select('iconLink')
		.exec(function(err, user) {
			if(err){
				next(err);
			} else {
				res.status (200).json(user);
			}
		});
	}
module.exports = router;