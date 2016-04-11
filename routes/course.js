"use strict";
var express = require('express');
var router = express.Router();
var Course = require('../models/course');
var Dept = require('../models/dept');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateTokenPartial(req, res, next);
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
					var courseCode = req.body.courseCode;
					var courseSection = req.body.courseSection || '';
					Course.create({
						courseCode: courseCode.toUpperCase() + courseSection.toUpperCase(),
						courseName: req.body.courseName,
						deptCode: req.params.did.toUpperCase(),
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
		find(req, res, next, function(course) {
			course.info.sort({dateOfComment: -1});
			res.status(200).json(course);
		});
	})

	.post(function(req, res, next) {
		// add comment
		var info = {
			author: req.decoded.uid,
			icon: req.decoded.icon,
			rating: req.body.rating,
			outline: req.body.outline,
			assessMethod: req.body.assessMethod,
			comment: req.body.comment,
			dateOfComment: Date.now()
		};

		find(req, res, next, function(course) {
			var repeat = false;
			course.info.forEach(function(c) {
				if (c.author === req.decoded.uid) {
					repeat = true;
				}
			});
			if (!repeat) {
				course.update({$push: {info: info}}, function(err) {
					if (err) {
						return next(err);
					} else {
						utils.addPoint(req.decoded.uid, 5, function(err) {
							if (err) {
								return next(err);
							} else {
								find(req, res, next, function(course) {
									course.info.sort({dateOfComment: -1});
									res.status(200).json(course);
								});
							}
						});
					}
				});
			} else {
				res.status(400).json({error: "You have made comment"});
			}
		});
	})

	.put(function(req, res, next) {
		// edit course info
		if (req.decoded.admin) {
			find(req, res, next, function(course) {
				course.update({$set: {
					courseName: req.body.courseName,
					schedule: req.body.schedule,
					prof: req.body.prof
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next, function(course) {
							course.info.sort({dateOfComment: -1});
							res.status(200).json(course);
						});
					}
				});
			});
		} else {
			res.status(401).json({error: "You are not authorized to edit a course!"});
		}
	})

	.delete(function(req, res, next) {
		// delete course
		if (req.decoded.admin) {
			find(req, res, next, function(course) {
				req.params.did = course.deptCode;
				course.remove();
				findList(req, res, next);
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a course!"});
		}	
	});

router.route('/info/:cid/:cmid')
	.delete(function(req, res, next) {
		// delete comment
		if (req.decoded.admin) {
			find(req, res, next, function(course) {
				course.update({$pull: {info: {_id: req.params.cmid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						utils.deductPoint(req.decoded.uid, 5, function(err) {
							if (err) {
								return next(err);
							} else {
								find(req, res, next, function(course) {
									course.info.sort({dateOfComment: -1});
									res.status(200).json(course);
								});
							}
						});
						
					}
				});
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
			} else if (courses === null) {
				res.status(400).json({error: "Department not found!"});
			} else {
				res.status(200).json(courses);
			}
		});
}

function find(req, res, next, callback) {
	Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
		if (err) {
			return next(err);
		} else if (!course) {
			res.status(400).json({error: "Course not found!"});
		} else {
			callback(course);		
		}
	});
}

module.exports = router;