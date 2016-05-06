"use strict";

// Module: item
// Purpose:
//    This module is used to facilitate the communication between the server and
//    the database regarding the information about the items. Different methods
//    are provided for the clients.
// Routes:
//    /api/item/
//       get: return a list of unsold items
//       post: post an item using the user's input then return a list of unsold items
//    /api/item/:itemid/
//       get: return the details of an item
//       put: change the details of an item the return its details
//       delete: change the status of an item to inactive
//    /api/item/requestion/:itemid
//       post: add an user to the interest list of an item by creating a new transaction
//       put: allow seller to sell an item and update all transactions' status
//       delete: remove an user from the interest list by deleting the transaction

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
	// set destination to the item folder
	destination: function (req, file, cb) {
		cb(null, './public/images/item/');
	},
	filename: function (req, file, cb) {
		// rename the file
		var originalName = file.originalname;
		var ext = originalName.split('.');
		cb(null, Date.now() + '.' + ext[ext.length-1]);
	}
});

var upload = multer({
	// check the type of the file
	storage: storage,
	fileFilter: function(req, file, cb) {
		if (file.mimetype.slice(0,5) === 'image') {
			cb(null, true);
		} else {
			// raise error if it is not an image
			cb(new Error('Not an image file!'));
		}	
	},
	// set limit to file size
	limits: {fileSize: 1048576}
});

router.use(function(req, res, next) {
	// require a valid token to access this route
	utils.validateToken(req, res, next);
});

router.route('/')

	// Purpose: get a list of the unsold items
	// Input: none
	// Output:
	//    A list of item objects containing deptCode, courseCode, name,
	//    price, priceFlexible, date, seller, img
	// Implementation:
	//    Find all the items with active=true and sold=false from the database 
	//    and return the list
	
	.get(function(req, res, next) {
		findUnsoldList(req, res, next);
	})

	// Purpose: upload an item and return a list of unsold items
	// Input:
	//    deptCode
	//    courseCode
	//    name
	//    description
	//    img
	//    price
	//    priceFlexible
	// Output:
	//    A list of item objects containing deptCode, courseCode, name,
	//    price, priceFlexible, date, seller, img
	// Implementation:
	//    First check if there user has uploaded a file, then call the getCategory
	//    method to interpret the category of the item. Then create a new item in
	//    the database. At last return a list of unsold items by finding the
	//    corresponding items in the data base.

	.post(upload.single('img'), function(req, res, next) {
		// post a new item
		if (!req.file) {
			// raise error if nothing is uploaded
			res.status(400).json({error: 'No image uploaded.'});
		} else {
			// create a new item using the info provided
			req.body.code = req.body.code || '';
			// get the category of the item using the getCategory method
			getCategory(req, res, next, function(category) {
				Item.create({
					category: category,
					seller: req.decoded.uid,
					icon: req.decoded.icon,
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
						// return a list of unsold items
						findUnsoldList(req, res, next);
					}
				});
			});	
		}
	});

router.route('/:itemid')

	// Purpose: get the info of an item
	// Input:
	//    itemid
	// Output:
	//    An item object
	// Implementation:
	//    Find the item from the database by looking for the corresponding item id

	.get(function(req, res, next) {
		find(req, res, next, function(item) {
			res.status(200).json(item);
		});
	})

	// Purpose: edit the info of an item
	// Input:
	//    itemid
	//    name
	//    description
	//    price
	//    priceFlexible
	// Output:
	//    An updated item object
	// Implementation:
	//    First find the corresponding item from the database using the item id,
	//    then check if the user is the seller of the item. Update the database
	//    with the new details and return the details of the updated item.

	.put(function(req, res, next) {
		// edit an item
		// find the corresponding item from the item id
		find(req, res, next, function(item) {
			// check if the user is the seller
			if (item.seller === req.decoded.uid) {
				// update the item details from the info given by the user
				item.update({$set: {
					name: req.body.name,
					description: req.body.description,
					price: req.body.price,
					priceFlexible: req.body.priceFlexible
				}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// return the info of the item
						find(req, res, next, function(result) {
							res.status(200).json(result);
						});
					}
				});
			} else {
				// raise error if the user is not the seller
				res.status(401).json({error: "You are not the seller of the item!"});
			}
		});
	})

	// Purpose: remove an item by setting its status to inactive
	// Input:
	//    itemid
	// Output:
	//    A list of item objects containing deptCode, courseCode, name,
	//    price, priceFlexible, date, seller, img
	// Implementation:
	//    First find the corresponding item from the database using the item id,
	//    then check if the user is the seller of the item or an admin. Update 
	//    all the transactions of the item to set their status to cancel and set
	//    the item status to inactive. Return a success message.


	.delete(function(req, res, next) {
		// remove an item
		// find the responding item from the item id
		find(req, res, next, function(item) {
			// check if the user is the seller or an admin
			if (item.seller === req.decoded.uid || req.decoded.admin) {
				// set all corresponding transaction records to cancelled
				Transaction.update({item: req.params.itemid}, 
					{$set: {
						status: 'Cancelled', 
						dateOfUpdate: Date.now()
					}}, function(err) {
						if (err) {
							return next(err);
						} else {
							// change the status of the item into inactive
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
				// raise error if user is not the seller or an admin
				res.status(401).json({error: "You are not authorized to delete an item!"});
			}
		});
	});

router.route('/request/:itemid')
	
	// Purpose: show interest in an item
	// Input:
	//    itemid
	// Output:
	//    An updated item object
	// Implementation:
	//    First find the corresponding item from the database using the item id,
	//    then check if the user is not the seller of the item. Push the user id
	//    and icon link to the buyer list in the item. Then, check if there is
	//    not a transaction on this item with this user as buyer. Create a new
	//    transaction after that. Inform the user by creating an update message.
	//    Return the updated item.

	.post(function(req, res, next) {
		// find the corresponding item from the item id
		find(req, res, next, function(item) {
			// check that the user is not the seller
			if (item.seller !== req.decoded.uid) {
				// push the user into the interest list
				item.update({$push: {buyer: {uid: req.decoded.uid, icon: req.decoded.icon}}}, function(err) {
					if (err) {
						return next(err);
					} else {
						// try to find a transaction record between this user and the item
						Transaction.findOne({
							item: req.params.itemid, 
							buyer: req.decoded.uid
						}, function(err, transaction) {
							if (err){
								return next(err);
							} else if (!transaction) {
								// create a new trasaction if a transaction record is not found
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
										// inform the seller
										utils.informUser(item.seller, {
											topic: 'Item ' + item.name,
											content: req.decoded.uid + ' is interested in your item. Check your item info page to contact him/her.',
											date: Date.now()
										}, function(err) {
											if (err) {
												return next(err);
											} else {
												// return the item info
												find(req, res, next, function(result) {
													res.status(200).json(result);
												});
											}
										});
									}
								});
							} else {
								// raise error if a transaction already exists
								res.status(400).json({error: "Transaction already exists!"});
							}
						});
					}
				});
			} else {
				// raise error if the user is the seller
				res.status(401).json({error: "You are cannot buy your own item!"});
			}
		});
	})

	// Purpose: sell an item
	// Input:
	//    itemid
	//    uid: buyer's uid
	// Output:
	//    An updated item object
	// Implementation:
	//    First find the corresponding item from the database using the item id,
	//    then check if the user is the seller and check if the item is still 
	//    active and not sold. Update the item status to sold and inactive, find
	//    the transaction with buyer and set it as success, update other transactions
	//    as failed. Inform the buyer by creating an update message. Return the 
	//    updated item.

	.put(function(req, res, next) {
		// sell an item
		// find the corresponding item from the item id
		find(req, res, next, function(item) {
			// check if the user is the seller and check if the item is still active and not sold
			if (item.active && !item.sold && item.seller === req.decoded.uid){
				// update the item status to sold and inactive
				item.update({$set: {
					sold: true,
					active: false
				}}, function(err){
					if(err){
						return next(err);
					} else {
						// find the corresponding transaction with the buyer provided
						Transaction.findOne({
							item: req.params.itemid,
							buyer: req.body.uid
						}, function(err, transaction){
							if (err) {
								return next(err);
							} else if (transaction === null){
								// raise error if the transaction cannot be found
								res.status(400).json({error: "Buyer uid incorrect!"});
							} else {
								// find the list of transaction of this item
								Transaction.find({item: req.params.itemid}, function(err, transactions) {
									if (err) {
										return next(err);
									} else {
										// set the status of the transactions
										async.each(transactions, function(record, callback) {
											// if the buyer in the transaction is the one who get the item, set status to success
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
												// for other buyers, set status to failed
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
												// inform the buyer who get the item that transaction is confirmed
												utils.informUser(req.body.uid, {
													topic: 'Item ' + item.name,
													content: 'Your transaction with ' + item.seller + ' is confirmed.',
													date: Date.now()
												}, function(err) {
													if (err) {
														return next(err);
													} else {
														// return the info of the item
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
					}
				});
			} else {
				// raise error if the user is not the seller
				res.status(401).json({error: "You are not the seller of the item!"});
			}
		});
	})

	// Purpose: remove user from the interest list of an item
	// Input:
	//    itemid
	// Output:
	//    An updated item object
	// Implementation:
	//    First find the corresponding item from the database using the item id,
	//    then remove the user from the item's buyer list in the database. Then, 
	//    find the transaction of this buyer and remove it. Return the updated item.

	.delete(function(req, res, next) {
		// remove from the interest list of an item
		// find the corresponding item from the item id
		find(req, res, next, function(item) {
			// remove the buyer from the interest list
			item.update({$pull: {buyer: {uid: req.decoded.uid, icon: req.decoded.icon}}}, function(err) {
				if (err) {
					return next(err);
				} else {
					// delete the transaction between the buyer and the item
					Transaction.findOneAndRemove({
						item: req.params.itemid, 
						buyer: req.decoded.uid
					}, function(err){
						if (err) {
							return next(err);
						} else {
							// return the info of the item
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
	// find the list of unsold items
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
	// find an item given an item id
	Item.findOne({_id: req.params.itemid}, function(err, item) {
		if (err) {
			next(err);
		} else if (item === null) {
			// raise error if item is not found
			res.status(400).json({error: "Item not found!"});
		} else {
			callback(item);
		}
	});	
}

function getCategory(req, res, next, callback) {
	// return a category for the item from the user's input
	// check if the input is not empty
	if (req.body.code) {
		var category;
		// find a list of courses from the first character of the input
		Course.find({deptCode: req.body.code.substring(0, 4).toUpperCase()}, function(err, courses) {
			if (err) {
				return next(err);
			} else if (courses.length === 0) {
				// if no course can be found, return category as GENERAL
				callback('GENERAL');
			} else {
				// set category as the first 4 character of the input, if a course can be found with the full input then substitute category with the course code
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
		// if input is empty, return category as GENERAL
		callback('GENERAL');
	}
}

module.exports = router;