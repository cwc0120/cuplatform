"use strict";
var express = require('express');
var router = express.Router();
var Thread = require('../models/thread');
var Course = require('../models/course');
var utils = require('../utils');

router.use(function(req, res, next) {
	// a valid token is required for using this route
	utils.validateToken(req, res, next);
});

router.route('/:cid')
	.get(function(req, res, next) {
		// get all threads under a course
		// check if the user is taking the course or not
		var courseStudent = false;
		for (var i = 0; i < req.decoded.coursesTaken.length; i++){
			// compare the course id to the course taken by the user
			if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i].slice(0, 8)) {
				courseStudent = true;
			}
		}
		// check if the user is taking the course or the user is an admin or the page of thread is GENERAL 
		if (courseStudent || req.decoded.admin || req.params.cid === 'General') {
			// return the list of thread
			findList(req, res, next);
		} else {
			// raise error if user is not taking the course nor an admin
			res.status(400).json({error: "You are not taking this course!"});
		}
	})

	.post(function(req, res, next) {
		// post a new thread
		// find the course from the course id
		Course.findOne({courseCode: new RegExp(req.params.cid.toUpperCase())}, function(err, course) {
			if (err) {
				return next(err);
			} else if (course === null) {
				// if course cannot be found, set the type of thread as GENERAL and create a new thread
				Thread.create({
					courseCode: 'GENERAL',
					author: req.decoded.uid,
					icon: req.decoded.icon,
					annoymous: req.body.annoymous,
					topic: req.body.topic,
					content: req.body.content,
					dateOfThread: Date.now(),
					dateOfUpdate: Date.now()
				}, function(err) {
					if (err) {
						return next(err);
					} else {
						// add 1 point to the user
						utils.addPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								// return the list of thread of the course
								findList(req, res, next);
							}
						});
					}
				});
			} else {
				// if a course can be found, check if the user is taking the course
				var courseStudent = false;
				for (var i=0; i<req.decoded.coursesTaken.length; i++){
					// compare the course id and the course taken by the user
					if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i].slice(0, 8)){
						courseStudent = true;
					}
				}
				// check if user is taking the course or is an admin
				if (courseStudent || req.decoded.admin) {
					// create a thread of the course
					Thread.create({
					courseCode: req.params.cid.toUpperCase(),
					author: req.decoded.uid,
					icon: req.decoded.icon,
					annoymous: req.body.annoymous,
					topic: req.body.topic,
					content: req.body.content,
					dateOfThread: Date.now(),
					dateOfUpdate: Date.now()
					}, function(err) {
					if (err) {
						return next(err);
					} else {
						// add 1 point to the user
						utils.addPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								// return the list of thread of the course
								findList(req, res, next);
							}
						});
					}
					});
				} else {
					// raise error if user is not taking the course but is trying to post a thread under the course
					res.status(400).json({error: "You are not taking this course!"});
				}		
				
			}
		});
	});

router.route('/detail/:tid') 
	.get(function(req, res, next) {
		// get detail of a thread
		// find the thread from the thread id
		find(req, res, next, function(thread) {
			// check if the user is taking the course or the type of thread is GENERAL
			var courseStudent = false;
			if (thread.courseCode === 'GENERAL'){
				courseStudent = true;
			} else {
				for (var i=0; i<req.decoded.coursesTaken.length; i++){
					// compare course id and the course taken by the student
					if(thread.courseCode === req.decoded.coursesTaken[i].slice(0, 8)){
						courseStudent = true;
					}
				}
			}
			// check if user is taking the course or is an admin
			if (courseStudent || req.decoded.admin){
				res.status(200).json(thread);
			} else {
				// raise error if user is not taking the course nor an admin
				res.status(400).json({error: "You are not taking this course!"});
			}
			
		});
	})

	.post(function(req, res, next) {
		// post a comment
		// declare comment using the user's id, icon link and the content fomr user's input
		var comment = {
			author: req.decoded.uid,
			icon: req.decoded.icon,
			content: req.body.content,
			dateOfComment: Date.now()
		};
		// find the corresponding thread from the thread id
		find(req, res, next, function(thread) {
			// check if the user is taking the course
			var courseStudent = false;
			// check if the thread type is GENERAL
			if (thread.courseCode === 'GENERAL'){
				courseStudent = true;
			} else {
				for (var i = 0; i < req.decoded.coursesTaken.length; i++) {
					// compare course code of the thread with the courses taken by the user
					if(thread.courseCode === req.decoded.coursesTaken[i].slice(0, 8)) {
						courseStudent = true;
					}
				}
			}
			// check if the user is taking the course or is an admin
			if (courseStudent || req.decoded.admin) {
				// update thread by pushing the comment into the thread and set the current time as the date of update
				thread.update({
					$push: {comment: comment},
					$set: {dateOfUpdate: Date.now()}
				}, function(err) {
					if (err) {
						return next(err);
					} else {
						// add 1 point to the user
						utils.addPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								// inform author of the thread that someone has made a comment
								utils.informUser(thread.author, {
									topic: 'Thread ' + thread.topic + ' at ' + thread.courseCode,
									content: req.decoded.uid + ' has made a comment on your thread.',
									date: Date.now()
								}, function(err) {
									if (err) {
										return next(err);
									} else {
										// return the info of the thread
										find(req, res, next, function(thread) {
											res.status(200).json(thread);
										});
									}
								});
							}
						});
					}
				});
			} else {
				// raise error if user is not taking the course of the thread nor the user is an admin
				res.status(400).json({error: "You are not taking this course!"});
			}		
		});
	})

	.put(function(req, res, next) {
		// edit a thread
		// find the corresponding thread from the thread id
		find(req, res, next, function(thread) {
			// check if the user is the author of the thread
			if (thread.author === req.decoded.uid) {
				// update thread with the new content
				thread.update({$set: {
					content: req.body.content,
					dateOfUpdate: Date.now()
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// return content the thread
						find(req, res, next, function(thread) {
							res.status(200).json(thread);
						});
					}
				});
			} else {
				// raise error if user is not the author
				res.status(401).json({error: "You are not the author of the thread!"});
			}
		});
	})

	.delete(function(req, res, next) {
		// delete a thread
		// check uf user is an admin
		if (req.decoded.admin) {
			// find the thread from the thread id
			find(req, res, next, function(thread) {
				// remove thread, deduct 1 point from author and return the list of threads of the course
				req.params.cid = thread.courseCode;
				thread.remove();
				utils.deductPoint(req.decoded.uid, 1, function(err) {
					if (err) {
						return next(err);
					} else {
						// return list of threads of the course
						findList(req, res, next);
					}
				});
			});
		} else {
			// raise error if the user is not an admin
			res.status(401).json({error: "You are not authorized to delete a thread!"});
		}
	});

router.route('/detail/:tid/:cmid')
	.delete(function(req, res, next) {
		// delete a comment
		// check if user is an admin
		if (req.decoded.admin) {
			// find the corresponding thread from the thread id
			find(req, res, next, function(thread) {
				// remove the corresponding comment with the comment id from the thread
				thread.update({$pull: {comment: {_id: req.params.cmid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// deduct 1 point from the author of the comment
						utils.deductPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								// return the content of the thread
								find(req, res, next, function(thread) {
									res.status(200).json(thread);
								});
							}
						});	
					}
				});
			});
		} else {
			// raise error if user is not an admin
			res.status(401).json({error: "You are not authorized to delete a comment!"});
		}	
	});

router.route('/report/:tid')
	.post(function(req, res, next) {
		console.log(req.body.content);
		// find the corresponding thread from thread id
		find(req, res, next, function(thread) {
			// send a message to inform admin with the report
			utils.informAdmin({
				topic: 'ADMIN: Thread ' + thread.topic + ' at ' + thread.courseCode,
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

function findList(req, res, next) {
	// return a list of thread given a course id
	Thread.find({courseCode: req.params.cid.toUpperCase()})
		.select('topic author dateOfUpdate annoymous')
		.exec(function(err, threads) {
			if (err) {
				return next(err);
			} else {
				// update author to annoymous if thread.annoymous is true
				for (var i = 0; i < threads.length; i++) {
					if (threads[i].annoymous) {
						threads[i].author = 'Annoymous';
					}
				}
				res.status(200).json(threads);
			}
		});
}

function find(req, res, next, callback) {
	// return a thread given a thread id
	Thread.findOne({_id: req.params.tid}, function(err, thread) {
		if (err) {
			return next(err);
		} else if (thread === null) {
			// raise error if thread is not found
			res.status(400).json({error: "Thread not found!"});
		} else {
			// update author to anonymous if thread.anonymous is true
			if (thread.annoymous) {
				thread.author = 'Anonymous';
				thread.icon = '';
			}
			callback(thread);
		}
	});
}

module.exports = router;