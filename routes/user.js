"use strict";

// Module: user
// Purpose:
//    This module is used to facilitate the communication between the server and
//    the database regarding the information about users. Different methods
//    are provided for the clients.
// Routes:
//    /api/user/profile/:uid/
//       get: get the details of an user
//       put: edit the details of an user
//    /api/user/icon/:uid/
//       post: upload icon of the user
//    /api/user/pwd/:uid/
//       put: change password of an user
//    /api/user/update/:updateid/
//       delete: delete update message of the user
//    /api/user/selllist/
//       get: get the list of items that the user is selling
//    /api/user/buylist/
//       get: get the list of items that the user is interested in
//    /api/user/timetable/:uid
//       get: get the timetable of the user
//       put: edit the timetable of the user


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
	// a valid token is required for this route
	utils.validateToken(req, res, next);
});

// upload user icon
var storage = multer.diskStorage({
	// set destination as the use folder
	destination: function (req, file, cb) {
		cb(null, './public/images/user/');
	},
	// use user name as file name
	filename: function (req, file, cb) {
		var originalName = file.originalname;
		var ext = originalName.split('.');
		var name = req.decoded.icon.split('.');
		cb(null, name[0] + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	storage: storage,
	// check the type of the file
	fileFilter: function(req, file, cb) {
		if (file.mimetype.slice(0,5) === 'image') {
			cb(null, true);
		} else {
			// raise error if file is not an image
			cb(new Error('Not an image file!'));
		}	
	},
	// set limit for the file size
	limits: {fileSize: 1048576}
});

router.route('/profile/:uid')
	// see the status of user 
	.get(function(req, res, next) {
		// get the info of the user from the uid
		find(req, res, next, function(user) {
			res.status(200).json(user);
		});
	})

	// edit user information (except timetable)
	.put(function(req, res, next) {
		// check if the user is the one that he is trying to edit
		if (req.params.uid === req.decoded.uid) {
			// find the corresponding user from the uid
			find(req, res, next, function(user) {
				// update user info
				user.update({$set: {
					gender: req.body.gender,
					major: req.body.major,
					intro: req.body.intro,
					birthday: req.body.birthday
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// return user info
						find(req, res, next, function(result) {
							res.status(200).json(result);
						});
					}
				});
			});
		} else {
			// raise error if the user is not the user that he is trying to edit
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

router.route('/icon/:uid')
	// upload icon
	.post(upload.single('img'), function(req, res, next) {
		// check if a file is uploaded
		if (!req.file) {
			// raise error if no image uploaded
			res.status(400).json({error: 'No image uploaded.'});
		} else if (req.params.uid === req.decoded.uid) {
			// check if the user is the one that he is trying to edit, return user info afterwards
			find(req, res, next, function(result) {
				res.status(200).json(result);
			});
		} else {
			// raise error if the user is not the user that he is trying to edit
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

router.route('/pwd/:uid')
	// change password
	.put(function(req, res, next) {
		// check if the user is the one that he is trying to edit
		if (req.params.uid === req.decoded.uid) {
			// find the corresponding user from the uid
			User.findOne({uid: req.params.uid}, function(err, user) {
				if (err) {
					return next(err);
				} else if (user === null) {
					// raise error if the user cannnot be found
					res.status(400).json({error: 'User not found'});
				} else {
					// get the salt from the user and calculate the hash value
					var salt = user.salt;
					var hash = crypto.pbkdf2Sync(req.body.oldPwd, salt, 10000, 512);
					// compare the calculated hash value and the hash value of the user
					if (hash != user.hash) {
						// raise error if hash not match
						res.status(400).json({error: 'Incorrect password'});
					} else if (req.body.newPwd1 !== req.body.newPwd2) {
						// raise error if new passwords not matched
						res.status(400).json({error: 'Password unmatched.'});
					} else {
						// generate new salt and calculate new hash value
						var newSalt = crypto.randomBytes(128).toString('base64');
						var newHash = crypto.pbkdf2Sync(req.body.newPwd1, newSalt, 10000, 512);
						// update the user salt and hash
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
			// raise error if the user is not the user that he is trying to edit
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

router.route('/update/:updateid')
	.delete(function(req, res, next) {
		// delete an update message
		// find the current user from the user id
		User.findOne({uid: req.decoded.uid}, function(err, user) {
			if (err) {
				return next(err);
			} else if (user === null) {
				// raise error if user is not found
				res.status(400).json({error: "User not found!"});
			} else {
				//  remove the corresponding update message
				user.update({$pull: {updates: {_id: req.params.updateid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// return the user info
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
	// find the items that is sold by the user
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
	// find the items that are interested by the user
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
		// find the course schedule of the user
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
 		// check if the user is editing his own timetable
 		if (req.params.uid === req.decoded.uid) {
			// check if there is time clash in timetable
			var clash = false;
			// get all the course schedule of the user 
			Course.find({_id: {$in: req.body.timetable}})
				.select('schedule')
				.exec(function(err, courses) {
					if (err) {
						return next(err);
					} else {
						// combine the schedule into one array
						var combinedSchedule = [];
						for (var i = 0; i < courses.length; i++) {
							combinedSchedule = combinedSchedule.concat(courses[i].schedule);
						}
						// check if there is time clash
						for (var j = 0; j < combinedSchedule.length - 1; j++) {
							for (var k = j + 1; k < combinedSchedule.length - 1; k++) {
								if (combinedSchedule[j].day === combinedSchedule[k].day && combinedSchedule[j].time === combinedSchedule[k].time){
									clash = true;
								}
							}
						}
						if (clash) {
							// raise error if time clash occured
							res.status(400).json({error: "Time clash occured!"});
						} else {
							// push courses into an array
							var selected = [];
							for (var i = 0; i < courses.length; i++) {
								selected.push(courses[i]._id);
							}
							// update the course taken by the user through the array
							User.findOneAndUpdate({uid: req.params.uid}, {
								$set: {coursesTaken: selected}
							}, function(err) {
								if (err) {
									return next(err);
								} else {
									// return the timetable of the user
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
 			// raise error if the user is not editing his own timetable
 			res.status(400).json({error: "You are not authorized to edit user information!"});
 		}
 	});
 	
function find(req, res, next, callback) {
	// get the user info from the uid
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
	// get the icon of the user
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