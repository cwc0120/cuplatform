"use strict";
var express = require('express');
var multer = require('multer');
var router = express.Router();
var Resource = require('../models/resource');
var Course = require('../models/course');
var User = require('../models/user');
var utils = require('../utils');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/');
	},
	filename: function (req, file, cb) {
		var originalName = file.originalname;
		var ext = originalName.split('.');
		cb(null, ext[0] + '-' + Date.now() + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	storage: storage,
	fileFilter: function(req, file, cb) {
		if (file.mimetype === 'application/msword' ||
			file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.mimetype === 'application/vnd.ms-powerpoint' ||
			file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
			file.mimetype === 'application/pdf') {
			cb(null, true);
		} else {
			cb(new Error('File type not supported.'));
		}	
	},
	limits: {fileSize: 10485760}
});

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/:cid')
	.get(function(req, res, next) {
		// see resources under course
		var courseStudent = false;
		for (var i=0; i<req.decoded.coursesTaken.length; i++){
			if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i]){
				courseStudent = true;
			}
		}
		if (courseStudent || req.decoded.admin){
			findResList(req, res, next);
		} else {
			res.status(400).json({error: "You are not taking this course!"});
		}
	})

	.post(upload.single('file'), function(req, res, next) {
		var courseStudent = false;
		for (var i=0; i<req.decoded.coursesTaken.length; i++){
			if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i]){
				courseStudent = true;
			}
		}
		if (courseStudent || req.decoded.admin) {
			if (!req.file) {
				res.status(400).json({error: 'No file uploaded.'});
			} else {
				Course.findOne({courseCode: new RegExp('^' + req.params.cid, 'i')}, function(err, course) {
					if (err) {
						return next(err);
					} else if (course === null) {
						res.status(400).json({error: 'Course not found!'});
					} else {
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
								utils.addPoint(req.decoded.uid, 10, function(err) {
									if (err) {
										return next(err);
									} else {
										findResList(req, res, next);
									}
								});
							}
						});
					}
				});
			}
		} else {
			res.status(400).json({error: "You are not taking this course!"});
		}		
	});

router.route('/info/:resid')
	.get(function(req, res, next) {
		// check resource info
		find(req, res, next, function(resource) {
			var courseStudent = false;
			for (var i=0; i<req.decoded.coursesTaken.length; i++){
				if(resource.courseCode === req.decoded.coursesTaken[i]){
					courseStudent = true;
				}
			}
			if (courseStudent || req.decoded.admin){
				res.status(200).json(resource);
			} else {
				res.status(400).json({error: "You are not taking this course!"});
			}	
		});
	})

	.post(function(req, res, next) {
		// post comment there
		var comment = {
			author: req.decoded.uid,
			icon: req.decoded.icon,
			content: req.body.content,
			dateOfComment: Date.now()
		};
		find(req, res, next, function(resource) {
			var courseStudent = false;
			for (var i=0; i<req.decoded.coursesTaken.length; i++) {
				if (resource.courseCode === req.decoded.coursesTaken[i]) {
					courseStudent = true;
				}
			}
			if (courseStudent || req.decoded.admin) {
				resource.update({$push: {comment: comment}}, function(err) {
					if (err) {
						return next(err);
					} else {
						utils.informUser(resource.uploader, {
							topic: 'Resource ' + resource.name + ' at ' + resource.courseCode,
							content: req.decoded.uid + ' has made a comment on your resource.',
							date: Date.now()
						}, function(err) {
							if (err) {
								return next(err);
							} else {
								find(req, res, next, function(resource) {
									res.status(200).json(resource);
								});
							}
						});
					}
				});
			} else {
				res.status(400).json({error: "You are not taking this course!"});
			}	
		});
	})

	.put(function(req, res, next) {
		// edit resource info
		find(req, res, next, function(resource) {
			if (resource.uploader === req.decoded.uid) {
				resource.update({$set: {
					name: req.body.name,
					description: req.body.description
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next, function(resource) {
							res.status(200).json(resource);
						});
					}
				});
			} else {
				res.status(401).json({error: "You are not the uploader of the resource!"});
			}
		});
	})

	.delete(function(req, res, next) {
		// delete resource
		if (req.decoded.admin) {
			find(req, res, next, function(resource) {
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
			res.status(401).json({error: "You are not authorized to delete a resource!"});
		}	
	});

router.route('/file/:resid')
	.get(function(req, res, next) {
		find(req, res, next, function(resource) {
			var courseStudent = false;
			for (var i=0; i<req.decoded.coursesTaken.length; i++){
				if(resource.courseCode === req.decoded.coursesTaken[i]){
					courseStudent = true;
				}
			}
			
			if (courseStudent || req.decoded.admin) {
				var file = './uploads/' + resource.link;
				User.findOne({uid: req.decoded.uid}, function(err, user) {
					if (err) {
						return next(err);
					} else if (user === null) {
						res.status(400).json({error: "User not found!"});
					} else {
						if (user.points >= 3) {
							utils.deductPoint(req.decoded.uid, 3, function(err) {
								if (err) {
									return next(err);
								} else {
									res.download(file, function(err) {
										if (err) {
											return next(err);
										} else {
											console.log('success!');
										}
									});
								}
							});
						} else {
							res.status(400).json({error: "You don't have enough points!"});
						}
					}
				});
			} else {
				res.status(400).json({error: "You are not taking this course!"});
			}	
		});
	});

router.route('/info/:resid/:cmid')
	.delete(function(req, res, next) {
		// delete comment
		if (req.decoded.admin) {
			find(req, res, next, function(resource) {
				resource.update({$pull: {comment: {_id: req.params.cmid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next, function(resource) {
							res.status(200).json(resource);
						});
					}
				});
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a comment!"});
		}	
	});

router.route('/report/:resid')
	.post(function(req, res, next) {
		find(req, res, next, function(resource) {
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
	Resource.findOne({_id: req.params.resid}, function(err, resource) {
		if (err) {
			return next(err);
		} else if (resource === null) {
			res.status(400).json({error: "Resource not found!"});
		} else {
			callback(resource);
		}
	});
}

module.exports = router;