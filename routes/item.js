"use strict";
var express = require('express');
var router = express.Router();
var Item = require('../models/item');
var Course = require('../models/course');
var utils = require('../utils');
var Transaction = require('../models/transaction');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		// see unsold the items
		findUnsoldList(req, res, next);
	})

	.post(function(req, res, next) {
		// post a new item
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
				active: true,
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

router.route('/:itemid')
	.get(function(req, res, next) {
		find(req, res, next);
	})

	.put(function(req, res, next) {
		// edit an item
		Item.findOne({_id: req.params.itemid}, function(err, item) {
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
		// delete item: find all transaction records -> set status cancelled -> delete item record 
		Item.findOne({_id: req.params.itemid}, function(err, item) {
			if (err) {
				return next(err);
			} else if (item === null) {
				res.status(400).json({error: "Item not found!"});
			} else {
				if (item.seller === req.decoded.uid || req.decoded.admin) {
					Transaction.find({item: req.params.itemid},function(err,transactions){
						if(err) {
							return next(err);
						} else {
							for (var i=0; i<transactions.length; i++) {
								transactions[i].status = 'cancelled';
								transactions[i].dateOfUpdate = Date.now();
							}
						}
					});
					item.active = false;
					findUnsoldList(req, res, next);
				} else {
					res.status(401).json({error: "You are not authorized to delete an item!"});
				}
			}
		});
	});

router.route('/buyrequest/:itemid')
	// interest in item: add new record -> set status interested
	.get(function(req, res, next) {
		Item.findOne({_id:req.params.itemid}, function(err, item) {
			if (err) {
				return next(err);
			} else { 
					Transaction.create({
						seller: item.seller,
						buyer: req.decoded.uid,
						item: req.params.itemid,
						status: 'interested',
						dateOfUpdate: Date.now(),
					}, function(err) {
						if (err) {
							return next(err);
						} else {
							find(req, res, next);
							}
						}
					);
				}
			}
		);
	})

	// uninterest item: delete the record 
	.delete(function(req, res, next) {
		Transaction.findOneAndRemove({item:req.params.itemid,buyer: req.decoded.uid
		}, function(err){
			if (err) {
				return next(err);
			} else {
				find(req, res, next);
				}
			});
		});

// transacted: find all related transactions -> set target success, set others failed
router.get('/transactrequest/:itemid/:uid', function(req, res, next) {
		Item.findOne({_id: req.params.itemid}, function(err, item) {
			if (err) {
				return next(err);
			} else if (item === null) {
				res.status(400).json({error: "Item not found!"});
			} else {
				if (item.seller === req.decoded.uid){
					item.update({$set: {
						sold: true,
						active: false
					}}, function(err){
						if(err){
							return next(err);
						} else{
							Transaction.find({item: req.params.itemid},function(err,transactions){
								if(err) {
									return next(err);
								} else {
									for (var i=0; i<transactions.length; i++) {
										if (transactions[i].buyer===req.params.uid){
											transactions[i].status = 'success';
											transactions[i].dateOfUpdate = Date.now();
										} else {
											transactions[i].status = 'failed';
											transactions[i].dateOfUpdate = Date.now();
										}
							}
							find(req, res, next);
						}});
					}});		
				} else {
					res.status(401).json({error: "You are not the seller of the item!"});
				}
			}
		});
	});

// return a list of items by searching items by seller's id
router.get('/selllist/:uid', function(req, res, next) {
	//if (req.params.uid === req.decoded.uid || req.decoded.admin)
	Item.find({seller:req.params.uid,active:true,sold:false})
		.sort({date: -1})
		.exec(function(err, items) {
			if(err){
				return next(err);
			}else{
				res.status(200).json(items);
			}
	});
});

// return a list of items by searching item records by buyer's id
router.get('/buylist/:uid', function(req, res, next) {
	Transaction.find({buyer:req.params.uid})
		.sort({dateOfUpdate: -1})
		.exec(function(err, transactions) {
			if(err){
				return next(err);
			}else{
				var items = transactions.map(function(transaction){
					return transaction.item;
				});
				res.status(200).json(items);
			}	
		});
	});	

function findUnsoldList(req, res, next) {
	Item.find({sold: false, active: true})
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
	Item.findOne({_id: req.params.itemid}, function(err, item) {
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