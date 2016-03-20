"use strict";
var express = require('express');
var router = express.Router();
var multer = require('multer');
var Resource = require('../models/resource');
var Course = require('../models/course');
var Dept = require('../models/dept');
var utils = require('../utils');

var upload = multer({
	dest: 'uploads/',
	fileFilter: function(req, file, cb) {
		if (file.mimetype == 'application/msword' ||
			file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.mimetype == 'application/vnd.ms-powerpoint' ||
			file.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
			file.mimetype == 'application/pdf') {
			cb(null, true);
		}
		cb(new Error('File type not supported.'));
	},
	limits: {fileSize: 10485760},
	rename: function(fieldname, filename) {
		return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
	},
	onFileUploadStart: function(file) {
		console.log(file.fieldname + ' is starting ...');
	},
	onFileUploadComplete: function(file) {
		console.log(file.fieldname + ' uploaded to  ' + file.path);
	}
});

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/dept/:did')
	.get(function(req, res, next) {
		// see resources under dept
		findDeptRes(req, res, next);
	})

	.post(function(req, res, next) {
		var resFile = upload.single('resFile');
		resFile(req, res, function(err) {
			if (err) {
				res.status(400).json({error: err});
			} else if (!req.file) {
				res.status(400).json({error: 'No file uploaded.'});
			} else {
				Dept.findOne({deptCode: req.body.deptCode}, function(err, dept) {
					if (err) {
						return next(err);
					} else if (dept === null) {
						res.status(400).json({error: 'Department not found!'});
					} else {
						Resource.create({
							deptCode: req.body.deptCode,
							name: req.body.name,
							description: req.body.description,
							uploader: req.decoded.uid,
							link: req.file.filename,
							dateOfUpload: Date.now(),
						}, function(err) {
							if (err) {
								return next(err);
							} else {
								findDeptRes(req, res, next);
							}
						});
					}
				});		
			}
		});
	});

router.route('/course/:cid')
	.get(function(req, res, next) {
		// see resources under course
		findCosRes(req, res, next);
	})

	.post(function(req, res, next) {
		var resFile = upload.single('resFile');
		resFile(req, res, function(err) {
			if (err) {
				res.status(400).json({error: err});
			} else if (!req.file) {
				res.status(400).json({error: 'No file uploaded.'});
			} else {
				Course.findOne({courseCode: req.body.courseCode}, function(err, course) {
					if (err) {
						return next(err);
					} else if (course === null) {
						res.status(400).json({error: 'Course not found!'});
					} else {
						Resource.create({
							courseCode: req.body.courseCode,
							name: req.body.name,
							description: req.body.description,
							uploader: req.decoded.uid,
							link: req.file.filename,
							dateOfUpload: Date.now(),
						}, function(err) {
							if (err) {
								return next(err);
							} else {
								findDeptRes(req, res, next);
							}
						});
					}
				});		
			}
		});
	});

router.route('/info/:id')
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
		Resource.findOne({_id: req.params.id}, 
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
		Resource.findOne({_id:req.params.id}, function(err, resource) {
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
			Resource.remove({_id: req.params.id}, function(err) {
				if (err) {
					return next(err);
				} else {
					Resource.find()
						.sort({dateOfUpload: -1})
						.select('name')
						.exec(function(err, resources) {
							if (err) {
								return next(err);
							} else {
								res.status(200).json(resources);
							}
						});
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a resource!"});
		}	
	});

router.route('/info/:id/:cmid')
	.delete(function(req, res, next) {
		// delete comment
		if (req.decoded.admin) {
			Resource.findOne({_id: req.params.id}, function(err, resource) {
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

function findDeptRes(req, res, next) {
	Resource.find({deptCode: req.params.did})
		.sort({dateOfUpload: -1})
		.select('name')
		.exec(function(err, resources) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(resources);
			}
		});
}

function findCosRes(req, res, next) {
	Resource.find({courseCode: req.params.cid})
		.sort({dateOfUpload: -1})
		.select('name')
		.exec(function(err, resources) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(resources);
			}
		});
}

function find(req, res, next) {
	Resource.findOne({_id: req.params.id}, function(err, resource) {
		if (err) {
			next(err);
		} else if (resource === null) {
			res.status(400).json({error: "Resource not found!"});
		} else {
			res.status(200).json(Resource);
		}
	});
}

module.exports = router;