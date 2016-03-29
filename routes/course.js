"use strict";
var express = require('express');
var router = express.Router();
var Course = require('../models/course');
var Dept = require('../models/dept');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/:did')
	.get(function(req, res, next) {
		// see course list under a dept
		findList(req, res, next);
	})

	.post(function(req, res, next) {
		// add new course under a dept
		if (req.decoded.admin) {
			Dept.findOne({deptCode: req.params.did.toUpperCase()}, function(err, dept) {
				if (err) {
					return next(err);
				} else if (dept === null) {
					res.status(400).json({error: "Department not found!"});
				} else {		
					Course.create({
						courseCode: req.body.courseCode.toUpperCase(),
						courseName: req.body.courseName,
						deptCode: req.params.did,
						schedule: req.body.schedule,
						prof: req.body.prof
					}, function(err) {
						if (err) {
							return next(err);
						} else {
							findList(req, res, next);
						}
					});
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to add a course!"});
		}
	});

router.route('/info/:cid')
	.get(function(req, res, next) {
		// check course info
		find(req, res, next);
	})

	.post(function(req, res, next) {
		// add comment
		var info = {
			author: req.decoded.uid,
			rating: req.body.rating,
			outline: req.body.outline,
			assessMethod: req.body.assessMethod,
			comment: req.body.comment,
			dateOfComment: Date.now()
		};
		Course.findOne({courseCode: req.params.cid.toUpperCase()}, 
			function(err, course) {
				if (err) {
					return next(err);
				} else if (course === null) {
					res.status(400).json({error: "Course not found!"});
				} else {
					var repeat = false;
					course.info.forEach(function(c) {
						if (c.author === req.decoded.uid) {
							repeat = true;
						}
					});
					if (!repeat) {
						course.update({$push: {info: info}}, 
						function(err) {
							if (err) {
								return next(err);
							} else {
								console.log('last');
								find(req, res, next);
							}
						});
					} else {
						res.status(400).json({error: "You have made comment"});
					}
				}
			}
		);	
	})

	.put(function(req, res, next) {
		// edit course info
		if (req.decoded.admin) {
			Course.update({courseCode: req.params.cid.toUpperCase()},
				{$set: {
					courseName: req.body.courseName,
					schedule: req.body.schedule,
					prof: req.body.prof
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next);
					}
				}
			);
		} else {
			res.status(401).json({error: "You are not authorized to edit a course!"});
		}
	})

	.delete(function(req, res, next) {
		// delete course
		if (req.decoded.admin) {
			Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
				if (err) {
					return next(err);
				} else if (course === null) {
					res.status(400).json({error: "Course not found!"});
				} else {
					req.params.did = course.deptCode;
					course.remove();
					findList(req, res, next);
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a course!"});
		}	
	});

router.route('/info/:cid/:cmid')
	.delete(function(req, res, next) {
		// delete comment
		if (req.decoded.admin) {
			Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
				if (err) {
					return next(err);
				} else if (course === null) {
					res.status(400).json({error: "Course not found!"});
				} else {
					course.update({$pull: {info: {_id: req.params.cmid}}}, function(err) {
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

function findList(req, res, next) {
	Course.find({deptCode: req.params.did.toUpperCase()})
		.select('courseCode courseName')
		.exec(function(err, courses) {
			if (err) {
				return next(err);
			} else if (courses === null ) {
				res.status(400).json({error: "Department not found!"});
			} else {
				res.status(200).json(courses);
			}
		});
}

function find(req, res, next) {
	Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
		if (err) {
			next(err);
		} else if (course === null) {
			res.status(400).json({error: "Course not found!"});
		} else {
			course.info.sort({dateOfComment: -1});
			res.status(200).json(course);
		}
	});
}

module.exports = router;