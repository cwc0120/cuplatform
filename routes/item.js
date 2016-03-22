"use strict";
var express = require('express');
var router = express.Router();
var Item = require('../models/item');
var Course = require('../models/course');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		// see unsold the items under a dept
		findUnsoldList(req, res, next);
	})

	.post(function(req, res, next) {
		// post a new item under a dept
		req.body.deptCode = req.body.deptCode || '';
		req.body.courseCode = req.body.courseCode || '';
		var deptCode = '';
		var courseCode = '';
		Course.find({deptCode: req.body.deptCode.toUpperCase()}, function(err, courses) {
			if (err) {
				return next(err);
			} else if (courses.length === 0) {
				deptCode = 'GENERAL';
			} else {
				deptCode = req.body.deptCode.toUpperCase();
				courseCode = 'OTHERS';
				for (var i = 0; i < courses.length; i++) {
					if (courses[i].courseCode === req.body.courseCode.toUpperCase()) {
						courseCode = courses[i].courseCode;
					}
				}
			}
			Item.create({
				deptCode: deptCode,
				courseCode: courseCode,
				seller: req.decoded.uid,
				name: req.body.name,
				description: req.body.description,
				price: req.body.price,
				priceFlexible: req.body.priceFlexible,
				sold: false,
				date: Date.now()
			}, function(err) {
				if (err) {
					return next(err);
				} else {
					findUnsoldList(req, res, next);
				}
			});
		});
	});

router.route('/info/:id')
	.get(function(req, res, next) {
		find(req, res, next);
	})

	.put(function(req, res, next) {
		// edit an item
		Item.findOne({_id:req.params.id}, function(err, item) {
			if (err) {
				return next(err);
			} else if (item === null) {
				res.status(400).json({error: "Item not found!"});
			} else {
				if (item.seller === req.decoded.uid) {
					item.update({$set: {
						name: req.body.name,
						description: req.body.description,
						price: req.body.price,
						priceFlexible: req.body.priceFlexible
					}}, function(err) {
						if (err) {
							return next(err);
						} else {
							find(req, res, next);
						}
					});
				} else {
					res.status(401).json({error: "You are not the seller of the item!"});
				}
			}
		});
	})

	.delete(function(req, res, next) {
		// delete item
		if (req.decoded.admin) {
			Item.remove({_id: req.params.id}, function(err) {
				if (err) {
					return next(err);
				} else {
					findUnsoldList(req, res, next);
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete an item!"});
		}
	});

router.get('/buyrequest/:id', function(req, res, next) {
	Item.findOne({_id:req.params.id}, function(err, item) {
		if (err) {
			return next(err);
		} else if (item === null) {
			res.status(400).json({error: "Item not found!"});
		} else {
			item.update({$push: {buyers: req.decoded.uid}}, 
			function(err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			});
		}
	});
});

router.get('/transactrequest/:id', function(req, res, next) {
	Item.findOne({_id:req.params.id}, function(err, item) {
		if (err) {
			return next(err);
		} else if (item === null) {
			res.status(400).json({error: "Item not found!"});
		} else {
			item.update({$set: {sold: true}}, 
			function(err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			});
		}
	});
});

// router.route('/myitems')
// 	// show my items
// 	.get(function(req, res, next){
// 		Item.find({seller: req.decoded.uid})
// 			.select ('deptCode courseCode name price priceFlexible date sold')
// 			.exec(function(err, items) {
// 				if (err) {
// 					return next(err);
// 				} else if (items === null ) {
// 					res.status(400).json({error: "No item!"});
// 				} else {
// 					res.status(200).json(items);
// 				}
// 			});	
// 	})

// 	.post(function(req, res, next) {
// 		Dept.findOne({deptCode: req.body.deptCode}, function(err, dept) {
// 			if (err) {
// 				return next(err);
// 			} else if (dept === null) {
// 				res.status(400).json({error: "Department not found!"});
// 			} else {
// 				Course.findOne({courseCode: req.body.courseCode}, function (err, course) {
// 					if (err) {
// 						return next(err);
// 					} else if (course === null) {
// 						res.status(400).json({error: "Course not found!"});
// 					} else {
// 						Item.create({
// 							uploader: req.decoded.uid,
// 							name: req.body.name,
// 							deptCode: req.body.deptCode,
// 							courseCode: req.body.courseCode,
// 							description: req.body.description,
// 							price: req.body.price,
// 							quantity: req.body.quantity
// 						}, function(err) {
// 							if (err) {
// 								return next(err);
// 							} else {
// 								findList(req, res, next);
// 							}
// 						});
// 					}})}
// 				});
// 			})

// router.route('/:deptid/:id')
// 	.get(function(req,res,next){
// 		find(req,res,next);	
// 	})

// 	.put(function(req, res, next) {
// 		Item.update(
// 			{_id: req.params.id, uploader: req.decoded.uid}, 
// 			{$set: {
// 				name: req.body.name,
// 				deptCode: req.body.deptCode,
// 				courseCode: req.body.courseCode,
// 				description: req.body.description,
// 				price: req.body.price,
// 				quantity: req.body.quantity
// 			}}, 
// 			function (err) {
// 				if (err) {
// 					return next(err);
// 				} else {
// 					find(req, res, next);
// 				}
// 			}
// 		);
// 	})
// 	.delete(function(req, res, next) {
// 		Item.findOne({_id: req.params.id, uploader: req.decoded.uid}, function(err, item) {
// 				if (err) {
// 					return next(err);
// 				} else if (item === null) {
// 					res.status(400).json({error: "Item not found!"});
// 				} else {
// 					item.remove();
// 					findList(req, res, next);
// 				}
// 			}
// 		);
// 	})


// router.route('/:deptid')
// 	.get(function(req,res,next){
// 		Item.find({deptCode: req.params.deptid})
// 			.select ('deptCode courseCode Name price date uploader')
// 			.sort({courseCode: 1})
// 			.exec(function(err, items) {
// 				if (err) {
// 					return next(err);
// 				} else if (items === null ) {
// 					res.status(400).json({error: "Items not found!"});
// 				} else {
// 					res.status(200).json(items);
// 				}
// 			});
// 	});

function findUnsoldList(req, res, next) {
	Item.find({sold: false})
		.sort({date: -1})
		.select ('deptCode courseCode name price priceFlexible date seller')
		.exec(function(err, items) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(items);
			}
		});
}

function find(req, res, next) {
	Item.findOne({_id: req.params.id}, function(err, item) {
		if (err) {
			next(err);
		} else if (item === null) {
			res.status(400).json({error: "Item not found!"});
		} else {
			res.status(200).json(item);
		}
	});	
}

module.exports = router;