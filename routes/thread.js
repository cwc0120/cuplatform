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
		findList(req, res, next);
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
					annoymous: req.body.annoymous,
					topic: req.body.topic,
					content: req.body.content,
					dateOfThread: Date.now(),
					dateOfUpdate: Date.now()
				}, function(err) {
					if (err) {
						return next(err);
					} else {
						findList(req, res, next);
					}
				});
			} else {		
				Thread.create({
					courseCode: course.courseCode,
					author: req.decoded.uid,
					annoymous: req.body.annoymous,
					topic: req.body.topic,
					content: req.body.content,
					dateOfThread: Date.now(),
					dateOfUpdate: Date.now()
				}, function(err) {
					if (err) {
						return next(err);
					} else {
						findList(req, res, next);
					}
				});
			}
		});
	});

router.route('/detail/:tid') 
	.get(function(req, res, next) {
		// get detail of a thread
		find(req, res, next);
	})

	.post(function(req, res, next) {
		// post a comment
		var comment = {
			author: req.decoded.uid,
			content: req.body.content,
			dateOfComment: Date.now()
		};
		Thread.findOne({_id: req.params.tid}, 
			function(err, thread) {
				if (err) {
					return next(err);
				} else if (thread === null) {
					res.status(400).json({error: "Thread not found!"});
				} else {
					thread.update({
						$push: {comment: comment},
						$set: {dateOfUpdate: Date.now()}
					}, function(err) {
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
		// edit a thread
		Thread.findOne({_id:req.params.tid}, function(err, thread) {
			if (err) {
				return next(err);
			} else if (thread === null) {
				res.status(400).json({error: "Thread not found!"});
			} else {
				if (thread.author === req.decoded.uid) {
					thread.update({$set: {
						content: req.body.content,
						dateOfUpdate: Date.now()
					}}, function(err) {
						if (err) {
							return next(err);
						} else {
							find(req, res, next);
						}
					});
				} else {
					res.status(401).json({error: "You are not the author of the thread!"});
				}
			}
		});
	})

	.delete(function(req, res, next) {
		// delete a thread
		if (req.decoded.admin) {
			Thread.findOne({_id: req.params.tid}, function(err, thread) {
				if (err) {
					return next(err);
				} else {
					req.params.cid = thread.courseCode;
					thread.remove();
					findList(req, res, next);
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a thread!"});
		}
	});

router.route('/detail/:tid/:cmid')
	.delete(function(req, res, next) {
		// delete a comment
		if (req.decoded.admin) {
			Thread.findOne({_id: req.params.tid}, function(err, thread) {
				if (err) {
					return next(err);
				} else if (thread === null) {
					res.status(400).json({error: "Thread not found!"});
				} else {
					thread.update({$pull: {comment: {_id: req.params.cmid}}}, function(err) {
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
	Thread.find({courseCode: req.params.cid.toUpperCase()})
		.sort({dateOfUpdate: -1})
		.select('topic content author dateOfUpdate annoymous')
		.exec(function(err, threads) {
			if (err) {
				return next(err);
			} else {
				for (var i = 0; i < threads.length; i++) {
					if (threads[i].annoymous) {
						threads[i].author = 'Annoymous';
					}
					if (threads[i].content.length > 100) {
						threads[i].content = threads[i].content.slice(0,100) + '...';
					}
				}
				res.status(200).json(threads);
			}
		});
}

function find(req, res, next) {
	Thread.findOne({_id: req.params.tid}, function(err, thread) {
		if (err) {
			next(err);
		} else if (thread === null) {
			res.status(400).json({error: "Thread not found!"});
		} else {
			if (thread.annoymous) {
				thread.author = 'Annoymous';
			}
			res.status(200).json(thread);
		}
	});
}

module.exports = router;