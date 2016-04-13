"use strict";
var express = require('express');
var router = express.Router();
var Thread = require('../models/thread');
var Course = require('../models/course');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/:cid')
	.get(function(req, res, next) {
		// get all threads under a course
		var courseStudent = false;
		for (var i = 0; i < req.decoded.coursesTaken.length; i++){
			if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i]) {
				courseStudent = true;
			}
		}
		if (courseStudent || req.decoded.admin || req.params.cid === 'General') {
			findList(req, res, next);
		} else {
			res.status(400).json({error: "You are not taking this course!"});
		}
	})

	.post(function(req, res, next) {
		// post a new thread
		Course.findOne({courseCode: req.params.cid.toUpperCase()}, function(err, course) {
			if (err) {
				return next(err);
			} else if (course === null) {
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
						utils.addPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								findList(req, res, next);
							}
						});
					}
				});
			} else {
				var courseStudent = false;
				for (var i=0; i<req.decoded.coursesTaken.length; i++){
					if(req.params.cid.toUpperCase() === req.decoded.coursesTaken[i]){
						courseStudent = true;
					}
				}
				if (courseStudent || req.decoded.admin) {
					Thread.create({
					courseCode: course.courseCode,
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
						utils.addPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								findList(req, res, next);
							}
						});
					}
					});
				} else {
					res.status(400).json({error: "You are not taking this course!"});
				}		
				
			}
		});
	});

router.route('/detail/:tid') 
	.get(function(req, res, next) {
		// get detail of a thread
		find(req, res, next, function(thread) {
			var courseStudent = false;
			if (thread.courseCode === 'GENERAL'){
				courseStudent = true;
			} else {
				for (var i=0; i<req.decoded.coursesTaken.length; i++){
					if(thread.courseCode === req.decoded.coursesTaken[i]){
						courseStudent = true;
					}
				}
			}
			if (courseStudent || req.decoded.admin){
				res.status(200).json(thread);
			} else {
				res.status(400).json({error: "You are not taking this course!"});
			}
			
		});
	})

	.post(function(req, res, next) {
		// post a comment
		var comment = {
			author: req.decoded.uid,
			icon: req.decoded.icon,
			content: req.body.content,
			dateOfComment: Date.now()
		};
		find(req, res, next, function(thread) {
			var courseStudent = false;
			if (thread.courseCode === 'GENERAL'){
				courseStudent = true;
			} else {
				for (var i = 0; i < req.decoded.coursesTaken.length; i++) {
					if(thread.courseCode === req.decoded.coursesTaken[i]) {
						courseStudent = true;
					}
				}
			}
			if (courseStudent || req.decoded.admin) {
				thread.update({
					$push: {comment: comment},
					$set: {dateOfUpdate: Date.now()}
				}, function(err) {
					if (err) {
						return next(err);
					} else {
						utils.addPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								utils.informUser(thread.author, {
									topic: 'Thread ' + thread.topic + ' at ' + thread.courseCode,
									content: req.decoded.uid + ' has made a comment on your thread.',
									date: Date.now()
								}, function(err) {
									if (err) {
										return next(err);
									} else {
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
				res.status(400).json({error: "You are not taking this course!"});
			}		
		});
	})

	.put(function(req, res, next) {
		// edit a thread
		find(req, res, next, function(thread) {
			if (thread.author === req.decoded.uid) {
				thread.update({$set: {
					content: req.body.content,
					dateOfUpdate: Date.now()
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next, function(thread) {
							res.status(200).json(thread);
						});
					}
				});
			} else {
				res.status(401).json({error: "You are not the author of the thread!"});
			}
		});
	})

	.delete(function(req, res, next) {
		// delete a thread
		if (req.decoded.admin) {
			find(req, res, next, function(thread) {
				req.params.cid = thread.courseCode;
				thread.remove();
				utils.deductPoint(req.decoded.uid, 1, function(err) {
					if (err) {
						return next(err);
					} else {
						findList(req, res, next);
					}
				});
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a thread!"});
		}
	});

router.route('/detail/:tid/:cmid')
	.delete(function(req, res, next) {
		// delete a comment
		if (req.decoded.admin) {
			find(req, res, next, function(thread) {
				thread.update({$pull: {comment: {_id: req.params.cmid}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						utils.deductPoint(req.decoded.uid, 1, function(err) {
							if (err) {
								return next(err);
							} else {
								find(req, res, next, function(thread) {
									res.status(200).json(thread);
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

router.route('/report/:tid')
	.post(function(req, res, next) {
		console.log(req.body.content);
		find(req, res, next, function(thread) {
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
	Thread.find({courseCode: req.params.cid.toUpperCase()})
		.select('topic author dateOfUpdate annoymous')
		.exec(function(err, threads) {
			if (err) {
				return next(err);
			} else {
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
	Thread.findOne({_id: req.params.tid}, function(err, thread) {
		if (err) {
			return next(err);
		} else if (thread === null) {
			res.status(400).json({error: "Thread not found!"});
		} else {
			if (thread.annoymous) {
				thread.author = 'Anonymous';
				thread.icon = '';
			}
			callback(thread);
		}
	});
}

module.exports = router;