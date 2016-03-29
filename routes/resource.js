"use strict";
var express = require('express');
var multer = require('multer');
var router = express.Router();
var Resource = require('../models/resource');
var Course = require('../models/course');
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
		findResList(req, res, next);
	})

	.post(upload.single('file'), function(req, res, next) {
		if (!req.file) {
			res.status(400).json({error: 'No file uploaded.'});
		} else {
			Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
				if (err) {
					return next(err);
				} else if (course === null) {
					res.status(400).json({error: 'Course not found!'});
				} else {
					Resource.create({
						courseCode: req.params.cid.toUpperCase(),
						name: req.body.name,
						description: req.body.description,
						uploader: req.decoded.uid,
						link: req.file.filename,
						dateOfUpload: Date.now(),
					}, function(err) {
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

router.route('/info/:resid')
	.get(function(req, res, next) {
		// check resource info
		find(req, res, next);
	})

	.post(function(req, res, next) {
		// post comment there
		var comment = {
			author: req.decoded.uid,
			content: req.body.content,
			dateOfComment: Date.now()
		};
		Resource.findOne({_id: req.params.resid}, 
			function(err, resource) {
				if (err) {
					return next(err);
				} else if (resource === null) {
					res.status(400).json({error: "Resource not found!"});
				} else {
					resource.update({$push: {comment: comment}}, 
					function(err) {
						if (err) {
							return next(err);
						} else {
							find(req, res, next);
						}
					});
				}
			}
		);	
	})

	.put(function(req, res, next) {
		// edit resource info
		Resource.findOne({_id:req.params.resid}, function(err, resource) {
			if (err) {
				return next(err);
			} else if (resource === null) {
				res.status(400).json({error: "Resource not found!"});
			} else {
				if (resource.uploader === req.decoded.uid) {
					resource.update({$set: {
						name: req.body.name,
						description: req.body.description
					}}, function(err) {
						if (err) {
							return next(err);
						} else {
							find(req, res, next);
						}
					});
				} else {
					res.status(401).json({error: "You are not the uploader of the resource!"});
				}
			}
		});
	})

	.delete(function(req, res, next) {
		// delete resource
		if (req.decoded.admin) {
			Resource.findOne({_id: req.params.resid}, function(err, resource) {
				if (err) {
					return next(err);
				} else {
					req.params.cid = resource.courseCode;
					resource.remove();
					findResList(req, res, next);
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a resource!"});
		}	
	});

router.route('/file/:resid')
	.get(function(req, res, next) {
		var file = './uploads/' + req.params.resid;
		res.download(file, function(err) {
			if (err) {
				return next(err);
			} else {
				console.log('success!');
			}
		});
	});

router.route('/info/:resid/:cmid')
	.delete(function(req, res, next) {
		// delete comment
		if (req.decoded.admin) {
			Resource.findOne({_id: req.params.resid}, function(err, resource) {
				if (err) {
					return next(err);
				} else if (resource === null) {
					res.status(400).json({error: "Resource not found!"});
				} else {
					resource.update({$pull: {comment: {_id: req.params.cmid}}}, function(err) {
						if (err) {
							return next(err);
						} else {
							find(req, res, next);
						}
					});
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a comment!"});
		}	
	});

function findResList(req, res, next) {
	Resource.find({courseCode: req.params.cid.toUpperCase()})
		.sort({dateOfUpload: -1})
		.select('name dateOfUpload uploader')
		.exec(function(err, resources) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(resources);
			}
		});
}

function find(req, res, next) {
	Resource.findOne({_id: req.params.resid}, function(err, resource) {
		if (err) {
			next(err);
		} else if (resource === null) {
			res.status(400).json({error: "Resource not found!"});
		} else {
			res.status(200).json(resource);
		}
	});
}

module.exports = router;