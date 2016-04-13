"use strict";
var express = require('express');
var multer = require('multer');
var crypto = require('crypto');
var router = express.Router();
var User = require('../models/user');
var Item = require('../models/item');
var Transaction = require('../models/transaction');
var Course = require('../models/course');
var utils = require('../utils');

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
		if (file.mimetype.slice(0,5) === 'image') {
			cb(null, true);
		} else {
			cb(new Error('Not an image file!'));
		}	
	},
	limits: {fileSize: 1048576}
});

router.route('/profile/:uid')
	// see the status of user 
	.get(function(req, res, next) {
		find(req, res, next, function(user) {
			res.status(200).json(user);
		});
	})

	// edit user information (except timetable)
	.put(function(req, res, next) {
		if (req.params.uid === req.decoded.uid) {
			find(req, res, next, function(user) {
				user.update({$set: {
					gender: req.body.gender,
					major: req.body.major,
					intro: req.body.intro,
					birthday: req.body.birthday
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next, function(result) {
							res.status(200).json(result);
						});
					}
				});
			});
		} else {
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

router.route('/icon/:uid')
	// upload icon
	.post(upload.single('img'), function(req, res, next) {
		if (!req.file) {
			res.status(400).json({error: 'No image uploaded.'});
		} else if (req.params.uid === req.decoded.uid) {
			find(req, res, next, function(user) {
				user.update({$set: {
					icon: req.file.filename
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next, function(result) {
							res.status(200).json(result);
						});
					}
				});
			});
		} else {
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

router.route('/pwd/:uid')
	// change password
	.put(function(req, res, next) {
		if (req.params.uid === req.decoded.uid) {
			User.findOne({uid: req.params.uid}, function(err, user) {
				if (err) {
					return next(err);
				} else if (user === null) {
					res.status(400).json({error: 'User not found'});
				} else {
					var salt = user.salt;
					var hash = crypto.pbkdf2Sync(req.body.oldPwd, salt, 10000, 512);
					if (hash !== user.hash) {
						res.status(400).json({error: 'Incorrect password'});
					} else if (req.body.newPwd1 !== req.body.newPwd2) {
						res.status(400).json({error: 'Password unmatched.'});
					} else {
						var newSalt = crypto.randomBytes(128).toString('base64');
						var newHash = crypto.pbkdf2Sync(req.body.newPwd1, newSalt, 10000, 512);
						user.update({$set: {
							salt: newSalt,
							hash: newHash
						}}, function(err) {
							if (err) {
								return next(err);
							} else {
								res.status(200).end();
							}
						});
					}
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

router.route('/update/:updateid')
	.delete(function(req, res, next) {
		User.findOne({uid: req.decoded.uid}, function(err, user) {
			if (err) {
				return next(err);
			} else if (user === null) {
				res.status(400).json({error: "User not found!"});
			} else {
				user.update({$pull: {updates: {_id: req.params.updateid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						req.params.uid = req.decoded.uid;
						find(req, res, next, function(user) {
							res.status(200).json(user);
						});
					}
				});
			}
		});
	});

// return a list of items by searching items by seller's id
router.get('/selllist', function(req, res, next) {
	Item.find({
		seller: req.decoded.uid
	}).sort({date: -1}).exec(function(err, items) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(items);
		}
	});
});

// return a list of items by searching item records by buyer's id
router.get('/buylist', function(req, res, next) {
	Transaction.find({buyer:req.decoded.uid})
	.populate('item')
	.sort({dateOfUpdate: -1})
	.exec(function(err, items) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(items);
		}	
	});	
});	

router.route('/timetable/:uid')
	// see a user's timetable
	.get(function(req, res, next) {
	// return a list of lessons
		User.findOne({uid: req.params.uid})
			.populate({
				path: 'coursesTaken',
				select: 'courseCode courseName schedule'
			})
			.select('coursesTaken')
			.exec(function(err, courses) {
				if (err){
					return next(err);
				} else {
					res.status(200).json(courses);
				}
			});
 	})

	// edit user's timetable (add course, delete course)
 	.put(function(req, res, next) {
 		if (req.params.uid === req.decoded.uid) {
	// update the user's timetable by $set
			var clash = false;
			console.log(req.body.timetable);
			Course.find({_id: {$in: req.body.timetable}})
				.select('schedule')
				.exec(function(err, courses) {
					if (err) {
						return next(err);
					} else {
						var combinedSchedule = [];
						for (var i = 0; i < courses.length; i++) {
							combinedSchedule = combinedSchedule.concat(courses[i].schedule);
						}
						for (var j = 0; j < combinedSchedule.length - 1; j++) {
							for (var k = j + 1; k < combinedSchedule.length - 1; k++) {
								if (combinedSchedule[j].day === combinedSchedule[k].day && combinedSchedule[j].time === combinedSchedule[k].time){
									clash = true;
								}
							}
						}
						if (clash) {
							res.status(400).json({error: "Time clash occured!"});
						} else {
							console.log(courses);
							var selected = [];
							for (var i = 0; i < courses.length; i++) {
								selected.push(courses[i]._id);
							}
							User.findOneAndUpdate({uid: req.params.uid}, {
								$set: {coursesTaken: selected}
							}, function(err) {
								if (err) {
									return next(err);
								} else {
									User.findOne({uid: req.params.uid})
									.populate({
										path: 'coursesTaken',
										select: 'courseCode courseName schedule'
									})
									.select('coursesTaken')
									.exec(function(err, courses) {
										if (err){
											return next(err);
										} else {
											res.status(200).json(courses);
										}
									});
								}
							});
						}
					}
				});	
 		} else {
 			res.status(400).json({error: "You are not authorized to edit user information!"});
 		}
 	});
 	
function find(req, res, next, callback) {
	User.findOne({uid: req.params.uid})
		.select('uid admin email icon gender birthday major intro points updates')
		.exec(function(err, user) {
			if (err) {
				return next(err);
			} else if (!user) {
				res.status(400).json({error: "User not found!"});
			} else {
				callback(user);		
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