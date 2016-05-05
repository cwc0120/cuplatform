"use strict";
var express = require('express');
var router = express.Router();
var Course = require('../models/course');
var Dept = require('../models/dept');
var utils = require('../utils');

router.use(function(req, res, next) {
	// require a valid token for part of this route
	utils.validateTokenPartial(req, res, next);
});

router.route('/:did')
	.get(function(req, res, next) {
		// see course list under a dept
		findList(req, res, next);
	})

	.post(function(req, res, next) {
		// add new course under a dept
		// check if the user is an admin
		if (req.decoded.admin) {
			// find the department with the department id
			Dept.findOne({deptCode: req.params.did.toUpperCase()}, function(err, dept) {
				if (err) {
					return next(err);
				} else if (dept === null) {
					// raise error if the department cannot be found
					res.status(400).json({error: "Department not found!"});
				} else {	
					// create a new course using the information from the admin
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
							// return the course list under a department
							findList(req, res, next);
						}
					});
				}
			});
		} else {
			// raise error if user is not an admin
			res.status(401).json({error: "You are not authorized to add a course!"});
		}
	});

router.route('/info/:cid')
	.get(function(req, res, next) {
		// check course info
		// find the course with the course id
		Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
			if (err) {
				return next(err);
			} else if (!course) {
				// raise error if the course cannot be found
				res.status(400).json({error: "Course not found!"});
			} else {
				// check if the user is logged in or not
				if (req.decoded) {
					var visitor = true;
					// check if the user is taking the course or not, allow him to access to course info if he is
					for (var i = 0; i < req.decoded.coursesTaken.length; i++){
						if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i]){
							visitor = false;
						}
					}
					// check if the user is admin or not, allow him to access to course info if he is
					if (req.decoded.admin) {
						visitor = false;
					}
					course.info.sort({dateOfComment: -1});
					res.status(200).json({course: course, visitor: visitor});
				} else {
					// if user is not logged in, limit his access to the course info
					course.info.sort({dateOfComment: -1});
					res.status(200).json({course: course, visitor: true});
				}
			}
		});
	})

	.post(function(req, res, next) {
		// add comment to course
		// save the details of the comment as the variable info
		var info = {
			author: req.decoded.uid,
			icon: req.decoded.icon,
			rating: req.body.rating,
			outline: req.body.outline,
			assessMethod: req.body.assessMethod,
			comment: req.body.comment,
			dateOfComment: Date.now()
		};
		// find the corresponding course with the course id
		find(req, res, next, function(course) {
			// check if the user has commented on this course before
			var repeat = false;
			course.info.forEach(function(c) {
				if (c.author === req.decoded.uid) {
					repeat = true;
				}
			});
			if (!repeat) {
				// if the user hasn't commented before, push the comment into the course and add points
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
				// raise error if user has commented before
				res.status(400).json({error: "You have made comment"});
			}	
		});
	})

	.put(function(req, res, next) {
		// edit course info
		// check if the user is an admin
		if (req.decoded.admin) {
			// find the corresponding course with the course id and update its info
			find(req, res, next, function(course) {
				course.update({$set: {
					courseName: req.body.courseName,
					schedule: req.body.schedule,
					prof: req.body.prof
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// return the course info
						find(req, res, next, function(course) {
							course.info.sort({dateOfComment: -1});
							res.status(200).json(course);
						});
					}
				});
			});
		} else {
			// raise error if user is not an admin
			res.status(401).json({error: "You are not authorized to edit a course!"});
		}
	})

	.delete(function(req, res, next) {
		// delete course
		// check if the user is an admin
		if (req.decoded.admin) {
			// find the corresponding course with the course id and remove it, return to the department page afterwards
			find(req, res, next, function(course) {
				req.params.did = course.deptCode;
				course.remove();
				findList(req, res, next);
			});
		} else {
			// raise error if the user is not an admin
			res.status(401).json({error: "You are not authorized to delete a course!"});
		}	
	});

router.route('/info/:cid/:cmid')
	.delete(function(req, res, next) {
		// delete comment
		// check if the user is an admin
		if (req.decoded.admin) {
			// find the corresponding course with the course id and remove the corresponding comment
			find(req, res, next, function(course) {
				course.update({$pull: {info: {_id: req.params.cmid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// deduct 5 points from the user
						utils.deductPoint(req.decoded.uid, 5, function(err) {
							if (err) {
								return next(err);
							} else {
								// return to the course page
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
			// raise error if the user is not an admin
			res.status(401).json({error: "You are not authorized to delete a comment!"});
		}	
	});

function findList(req, res, next) {
	// return a list of courses given a valid deparment id
	Course.find({deptCode: req.params.did.toUpperCase()})
		.select('courseCode courseName schedule')
		.exec(function(err, courses) {
			if (err) {
				return next(err);
			} else if (courses === null) {
				// raise error if department cannot be found
				res.status(400).json({error: "Department not found!"});
			} else {
				res.status(200).json(courses);
			}
		});
}

function find(req, res, next, callback) {
	// find a course given a course id
	Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
		if (err) {
			return next(err);
		} else if (!course) {
			//raise error if course cannot be found
			res.status(400).json({error: "Course not found!"});
		} else {
			callback(course);		
		}
	});
}

module.exports = router;