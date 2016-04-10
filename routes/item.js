"use strict";
var express = require('express');
var multer = require('multer');
var async = require('async');
var router = express.Router();
var Item = require('../models/item');
var Course = require('../models/course');
var utils = require('../utils');
var Transaction = require('../models/transaction');

// upload item img
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/images/item/');
	},
	filename: function (req, file, cb) {
		// use user name as file name
		var originalName = file.originalname;
		var ext = originalName.split('.');
		cb(null, Date.now() + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	storage: storage,
	fileFilter: function(req, file, cb) {
		if (file.mimetype.slice(0,5) === 'image') {
			cb(null, true);
		} else {
			cb(new Error('Not an image file!'));
		}	
	},
	limits: {fileSize: 1048576}
});

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		// see unsold the items
		findUnsoldList(req, res, next);
	})

	.post(upload.single('img'), function(req, res, next) {
		// post a new item
		if (!req.file) {
			res.status(400).json({error: 'No image uploaded.'});
		} else {
			req.body.code = req.body.code || '';
			getCategory(req, res, next, function(category) {
				Item.create({
					category: category,
					seller: req.decoded.uid,
					name: req.body.name,
					description: req.body.description,
					img: req.file.filename,
					price: req.body.price,
					priceFlexible: req.body.priceFlexible,
					sold: false,
					active: true,
					buyer: [],
					date: Date.now()
				}, function(err) {
					if (err) {
						return next(err);
					} else {
						findUnsoldList(req, res, next);
					}
				});
			});	
		}
	});

router.route('/:itemid')
	.get(function(req, res, next) {
		find(req, res, next, function(item) {
			res.status(200).json(item);
		});
	})

	.put(function(req, res, next) {
		// edit an item
		find(req, res, next, function(item) {
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
						find(req, res, next, function(result) {
							res.status(200).json(result);
						});
					}
				});
			} else {
				res.status(401).json({error: "You are not the seller of the item!"});
			}
		});
	})

	.delete(function(req, res, next) {
		// delete item: find all transaction records -> set status cancelled -> delete item record 
		find(req, res, next, function(item) {
			if (item.seller === req.decoded.uid || req.decoded.admin) {
				Transaction.update({item: req.params.itemid}, 
					{$set: {
						status: 'Cancelled', 
						dateOfUpdate: Date.now()
					}}, function(err) {
						if (err) {
							return next(err);
						} else {
							item.update({$set: {active: false}}, function(err) {
								if (err) {
									return next(err);
								} else {
									res.status(200).json({message: 'success'});
								}
							});
						}
					}
				);
			} else {
				res.status(401).json({error: "You are not authorized to delete an item!"});
			}
		});
	});

router.route('/request/:itemid')
	// interest in item: add new record -> set status interested
	.post(function(req, res, next) {
		find(req, res, next, function(item) {
			if (item.seller !== req.decoded.uid) {
				item.update({$push: {buyer: req.decoded.uid}}, function(err) {
					if (err) {
						return next(err);
					} else {
						Transaction.findOne({
							item:req.params.itemid, 
							buyer: req.decoded.uid
						}, function(err, transaction) {
							if (err){
								return next(err);
							} else if (!transaction) {
								Transaction.create({
									seller: item.seller,
									buyer: req.decoded.uid,
									item: req.params.itemid,
									status: 'Interested',
									dateOfUpdate: Date.now(),
								}, function(err) {
									if (err) {
										return next(err);
									} else {
										find(req, res, next, function(result) {
											res.status(200).json(result);
										});
									}
								});
							} else {
								res.status(400).json({error: "Transaction already exists!"});
							}
						});
					}
				});
			} else {
				res.status(401).json({error: "You are cannot buy your own item!"});
			}
		});
	})

	// transacted: find all related transactions -> set target success, set others failed
	.put(function(req, res, next) {
		find(req, res, next, function(item) {
			if (item.active && !item.sold && item.seller === req.decoded.uid){
				item.update({$set: {
					sold: true,
					active: false
				}}, function(err){
					if(err){
						return next(err);
					} else {
						Transaction.findOne({
							item: req.params.itemid,
							buyer: req.body.uid
						}, function(err, transaction){
							if (err) {
								return next(err);
							} else if (transaction === null){
								res.status(400).json({error: "Buyer uid incorrect!"});
							} else {
								Transaction.find({item: req.params.itemid}, function(err, transactions) {
									if (err) {
										return next(err);
									} else {
										async.each(transactions, function(record, callback) {
											if (record.buyer === req.body.uid) {
												record.update({
													$set: {status: 'Success', dateOfUpdate: Date.now()}
												}, function(err) {
													if (err) {
														callback(err);
													} else {
														callback();
													}
												});
											} else {
												record.update({
													$set: {status: 'Failed', dateOfUpdate: Date.now()}
												}, function(err) {
													if (err) {
														callback(err);
													} else {
														callback();
													}
												});
											}
										}, function(err) {
											if (err) {
												return next(err);
											} else {
												find(req, res, next, function(result) {
													res.status(200).json(result);
												});
											}
										});
									}
								});
							}
						});
					}
				});
			} else {
				res.status(401).json({error: "You are not the seller of the item!"});
			}
		});
	})

	// uninterest item: delete the record 
	.delete(function(req, res, next) {
		find(req, res, next, function(item) {
			item.update({$pull: {buyer: req.decoded.uid}}, function(err) {
				if (err) {
					return next(err);
				} else {
					Transaction.findOneAndRemove({
						item: req.params.itemid, 
						buyer: req.decoded.uid
					}, function(err){
						if (err) {
							return next(err);
						} else {
							find(req, res, next, function(result) {
								res.status(200).json(result);
							});
						}
					});
				}
			});
		});
	});

function findUnsoldList(req, res, next) {
	Item.find({sold: false, active: true})
	.sort({date: -1})
	.select ('category name price priceFlexible date seller img')
	.exec(function(err, items) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(items);
		}
	});
}

function find(req, res, next, callback) {
	Item.findOne({_id: req.params.itemid}, function(err, item) {
		if (err) {
			next(err);
		} else if (item === null) {
			res.status(400).json({error: "Item not found!"});
		} else {
			callback(item);
		}
	});	
}

function getCategory(req, res, next, callback) {
	if (req.body.code) {
		var category;
		Course.find({deptCode: req.body.code.substring(0, 4).toUpperCase()}, function(err, courses) {
			if (err) {
				return next(err);
			} else if (courses.length === 0) {
				callback('GENERAL');
			} else {
				category = req.body.code.substring(0, 4).toUpperCase();
				for (var i = 0; i < courses.length; i++) {
					if (courses[i].courseCode === req.body.code.toUpperCase()) {
						category = courses[i].courseCode;
					}
				}
				callback(category);
			}
		});
	} else {
		callback('GENERAL');
	}
}

module.exports = router;