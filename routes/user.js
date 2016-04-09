"use strict";
var express = require('express');
var multer = require('multer');
var router = express.Router();
var User = require('../models/user');
var Item = require('../models/item');
var Transaction = require('../models/transaction');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

// upload user icon
// var storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, './public/images/user/');
// 	},
// 	filename: function (req, file, cb) {
// 		// use user name as file name
// 		var originalName = file.originalname;
// 		var ext = originalName.split('.');
// 		cb(null, req.decoded.uid + '.' + ext[ext.length-1]);
// 	}
// });

// var upload = multer({
// 	storage: storage,
// 	fileFilter: function(req, file, cb) {
// 		if (file.mimetype.slice(0,5) == 'image') {
// 			cb(null, true);
// 		} else {
// 			cb(new Error('Not an image file!'));
// 		}	
// 	},
// 	limits: {fileSize: 1048576}
// });

router.route('/:uid')
	// see the status of user 
	.get(function(req, res, next) {
		find(req, res, next, function(user) {
			res.status(200).json(user);
		});
	})

	// edit user information (except timetable)
	.put(function(req, res, next) {
		if (req.params.id === req.decoded.uid) {

		} else {
			res.status(401).json({error: "You are not authorized to edit user information!"});
		}
	});

// router.route('/icon')
// 	// get an icon of user (optional)
// 	.get(function(req, res, next) {

// 	})

// 	// upload icon
// 	.post(function(req, res, next) {

// 	});

// router.router('/cred')
// 	// change password
// 	.put(function(req, res, next) {

// 	});

// return a list of items by searching items by seller's id
router.get('/selllist', function(req, res, next) {
	Item.find({
		seller: req.decoded.uid
	}).sort({date: -1}).exec(function(err, items) {
		if (err){
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

// router.route('/timetable/:id')
// 	// see a user's timetable
// 	.get(function(req, res, next) {
// 		// return a list of lessons
// 	})

// 	// edit user's timetable
// 	.put(function(req, res, next) {
// 		if (req.params.id === req.decoded.uid) {
// 			// update the user's timetable by $set
// 		} else {
// 			res.status(401).json({error: "You are not authorized to edit user information!"});
// 		}
// 	});
 	
function find(req, res, next, callback) {
	User.findOne({uid: req.params.uid})
		.select('uid iconLink gender major points')
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

module.exports = router;