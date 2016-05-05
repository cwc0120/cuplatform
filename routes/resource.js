"use strict";
var express = require('express');
var multer = require('multer');
var router = express.Router();
var Resource = require('../models/resource');
var Course = require('../models/course');
var User = require('../models/user');
var utils = require('../utils');

var storage = multer.diskStorage({
	// set destination to the uploads folder
	destination: function (req, file, cb) {
		cb(null, './uploads/');
	},
	// set file name
	filename: function (req, file, cb) {
		var originalName = file.originalname;
		var ext = originalName.split('.');
		cb(null, ext[0] + '-' + Date.now() + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	storage: storage,
	// check the type of the file
	fileFilter: function(req, file, cb) {
		if (file.mimetype === 'application/msword' ||
			file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.mimetype === 'application/vnd.ms-powerpoint' ||
			file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
			file.mimetype === 'application/pdf') {
			cb(null, true);
		} else {
			// raise error if the type is not supported
			cb(new Error('File type not supported.'));
		}	
	},
	// set limit to the file size
	limits: {fileSize: 10485760}
});

router.use(function(req, res, next) {
	// require a valid token to use this route
	utils.validateToken(req, res, next);
});

router.route('/:cid')
	.get(function(req, res, next) {
		// see resources under course
		var courseStudent = false;
		// check if the user is taking the course
		for (var i=0; i<req.decoded.coursesTaken.length; i++){
			if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i].slice(0, 8)){
				courseStudent = true;
			}
		}
		if (courseStudent || req.decoded.admin){
			// if the user is a student taking the course or an admin, return the resource list
			findResList(req, res, next);
		} else {
			// raise error if the student is not taking the course and is not an admin
			res.status(400).json({error: "You are not taking this course!"});
		}
	})

	.post(upload.single('file'), function(req, res, next) {
		// post resource
		var courseStudent = false;
		// check if the user is taking the course
		for (var i=0; i<req.decoded.coursesTaken.length; i++){
			if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i].slice(0, 8)){
				courseStudent = true;
			}
		}
		// check if the user is taking the course or the user is an admin
		if (courseStudent || req.decoded.admin) {
			// check if a file is uploaded or not
			if (!req.file) {
				// raise error if no file is uploaded
				res.status(400).json({error: 'No file uploaded.'});
			} else {
				// find the corresponding course from the course code provided
				Course.findOne({courseCode: new RegExp('^' + req.params.cid, 'i')}, function(err, course) {
					if (err) {
						return next(err);
					} else if (course === null) {
						// raise error if the course cannot be found
						res.status(400).json({error: 'Course not found!'});
					} else {
						// create a recourse
						Resource.create({
							courseCode: req.params.cid.toUpperCase().slice(0, 8),
							name: req.body.name,
							description: req.body.description,
							uploader: req.decoded.uid,
							icon: req.decoded.icon,
							link: req.file.filename,
							dateOfUpload: Date.now(),
						}, function(err) {
							if (err) {
								return next(err);
							} else {
								// add point to the user
								utils.addPoint(req.decoded.uid, 10, function(err) {
									if (err) {
										return next(err);
									} else {
										// return the resource list for the course
										findResList(req, res, next);
									}
								});
							}
						});
					}
				});
			}
		} else {
			// raise error if the user is not taking the course nor an admin
			res.status(400).json({error: "You are not taking this course!"});
		}		
	});

router.route('/info/:resid')
	.get(function(req, res, next) {
		// check resource info
		// find the corresponding resource from the resource id
		find(req, res, next, function(resource) {
			var courseStudent = false;
			// check if the user is taking the course or not
			for (var i=0; i<req.decoded.coursesTaken.length; i++){
				if(resource.courseCode === req.decoded.coursesTaken[i].slice(0, 8)){
					courseStudent = true;
				}
			}
			// check if the user is taking the course or the user is an admin
			if (courseStudent || req.decoded.admin){
				// return resource info
				res.status(200).json(resource);
			} else {
				// raise error if the user is not taking the course nor an admin
				res.status(400).json({error: "You are not taking this course!"});
			}	
		});
	})

	.post(function(req, res, next) {
		// post comment for resource
		// set variable comment from the user's input
		var comment = {
			author: req.decoded.uid,
			icon: req.decoded.icon,
			content: req.body.content,
			dateOfComment: Date.now()
		};
		// find the corresponding resource from the resource id
		find(req, res, next, function(resource) {
			var courseStudent = false;
			// check if the user is taking the course or not
			for (var i=0; i<req.decoded.coursesTaken.length; i++) {
				if (resource.courseCode === req.decoded.coursesTaken[i].slice(0, 8)) {
					courseStudent = true;
				}
			}
			// chekc if the user is taking the course or the user is an admin
			if (courseStudent || req.decoded.admin) {
				// push comment into the resource
				resource.update({$push: {comment: comment}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// inform the uploader of the resource
						utils.informUser(resource.uploader, {
							topic: 'Resource ' + resource.name + ' at ' + resource.courseCode,
							content: req.decoded.uid + ' has made a comment on your resource.',
							date: Date.now()
						}, function(err) {
							if (err) {
								return next(err);
							} else {
								// return the resource info
								find(req, res, next, function(resource) {
									res.status(200).json(resource);
								});
							}
						});
					}
				});
			} else {
				// raise error if the user is not taking the course nor an admin
				res.status(400).json({error: "You are not taking this course!"});
			}	
		});
	})

	.put(function(req, res, next) {
		// edit resource info
		// find the corresponding resource from the resource id
		find(req, res, next, function(resource) {
			// check if the user is the uploader
			if (resource.uploader === req.decoded.uid) {
				// update the resource info
				resource.update({$set: {
					name: req.body.name,
					description: req.body.description
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// return the resource info
						find(req, res, next, function(resource) {
							res.status(200).json(resource);
						});
					}
				});
			} else {
				// raise error if the user is not the uploader
				res.status(401).json({error: "You are not the uploader of the resource!"});
			}
		});
	})

	.delete(function(req, res, next) {
		// delete resource
		// check if the user is an admin
		if (req.decoded.admin) {
			// find the corresponding resource from the resource id
			find(req, res, next, function(resource) {
				// remove resource, deduct points and go back to the resource list page
				req.params.cid = resource.courseCode;
				resource.remove();
				utils.deductPoint(req.decoded.uid, 10, function(err) {
					if (err) {
						return next(err);
					} else {
						findResList(req, res, next);
					}
				});
			});
		} else {
			// raise error if the user is not an admin
			res.status(401).json({error: "You are not authorized to delete a resource!"});
		}	
	});

router.route('/file/:resid')
	.get(function(req, res, next) {
		// download the resource
		// find the corresponding resource from the resource id
		find(req, res, next, function(resource) {
			// check if the user is taking the course or not
			var courseStudent = false;
			for (var i=0; i<req.decoded.coursesTaken.length; i++){
				if(resource.courseCode === req.decoded.coursesTaken[i].slice(0, 8)){
					courseStudent = true;
				}
			}
			// check if the user is taking the course or the user is an admin
			if (courseStudent || req.decoded.admin) {
				// set the file link
				var file = './uploads/' + resource.link;
				// find the user from the uid
				User.findOne({uid: req.decoded.uid}, function(err, user) {
					if (err) {
						return next(err);
					} else if (user === null) {
						// raise error if user is not found
						res.status(400).json({error: "User not found!"});
					} else {
						// check if there are at least 3 points to download the resource
						if (user.points >= 3) {
							// deduct points
							utils.deductPoint(req.decoded.uid, 3, function(err) {
								if (err) {
									return next(err);
								} else {
									// download resource
									res.download(file, function(err) {
										if (err) {
											return next(err);
										} else {
											// output success in the log
											console.log('success!');
										}
									});
								}
							});
						} else {
							// raise error if there aren't sufficient points
							res.status(400).json({error: "You don't have enough points!"});
						}
					}
				});
			} else {
				// raise error if user is not taking the course nor an admin
				res.status(400).json({error: "You are not taking this course!"});
			}	
		});
	});

router.route('/info/:resid/:cmid')
	.delete(function(req, res, next) {
		// delete comment
		// check if user is an admin
		if (req.decoded.admin) {
			// find the corresponding resource from the resource id
			find(req, res, next, function(resource) {
				// remove comment from the resource
				resource.update({$pull: {comment: {_id: req.params.cmid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// return the info of the resource
						find(req, res, next, function(resource) {
							res.status(200).json(resource);
						});
					}
				});
			});
		} else {
			// raise error if the user is not an admin
			res.status(401).json({error: "You are not authorized to delete a comment!"});
		}	
	});

router.route('/report/:resid')
	.post(function(req, res, next) {
		// report a resource
		// find the corresponding resource from the resource id
		find(req, res, next, function(resource) {
			// inform admin for the report
			utils.informAdmin({
				topic: 'ADMIN: Resource ' + resource.name + ' at ' + resource.courseCode,
				content: req.body.content,
				date: Date.now()
			}, function(err) {
				if (err) {
					return next(err);
				} else {
					res.status(200).end();
				}
			});
		});
	});

function findResList(req, res, next) {
	// return a list of resources given a course code
	Resource.find({courseCode: req.params.cid.toUpperCase()})
		.select('name dateOfUpload uploader')
		.exec(function(err, resources) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(resources);
			}
		});
}

function find(req, res, next, callback) {
	// return a recourse given a resource id
	Resource.findOne({_id: req.params.resid}, function(err, resource) {
		if (err) {
			return next(err);
		} else if (resource === null) {
			// raise error if resource is not found
			res.status(400).json({error: "Resource not found!"});
		} else {
			callback(resource);
		}
	});
}

module.exports = router;