"use strict";
var express = require('express');
var router = express.Router();
var Item = require('../models/item');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		// see all the items
		findList(req, res, next);
	})



router.route('/myitems')
	.get(function(req,res,next){
		Item.find({uploader: req.decoded.uid})
			.sort({date: 1})
			.select ('deptCode courseCode Name Description price quantity date')
			.exec(function(err, items) {
				if (err) {
					return next(err);
				} else if (items === null ) {
					res.status(400).json({error: "No item!"});
				} else {
					res.status(200).json(items);
				}
			});	
	})
	.post(function(req, res, next) {
		Dept.findOne({deptCode: req.body.deptCode}, function(err, dept) {
			if (err) {
				return next(err);
			} else if (dept === null) {
				res.status(400).json({error: "Department not found!"});
			} else {
				Course.findOne({couseCode: req.body.courseCode}, function (err, course) {
					if (err) {
						return next(err);
					} else if (course === null) {
						res.status(400).json({error: "Course not found!"});
					} else {
						Item.create({
							uploader: req.decoded.uid,
							name: req.body.name,
							deptCode: req.body.deptCode,
							courseCode: req.body.courseCode,
							description: req.body.description,
							price: req.body.price,
							quantity: req.body.quantity
						}, function(err) {
							if (err) {
								return next(err);
							} else {
								find(req, res, next);
							}
						});
					}})}
				});
			})
	.put(function(req, res, next) {
		Item.update(
			{_id: req.params.id, uploader: req.decoded.uid}, 
			{$set: {
				name: req.body.name,
				deptCode: req.body.deptCode,
				courseCode: req.body.courseCode,
				description: req.body.description,
				price: req.body.price,
				quantity: req.body.quantity
			}}, 
			function (err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			}
		);
	})
	.delete(function(req, res, next) {
		Item.remove({_id: req.params.id, uploader: req.decoded.uid}, function(err) {
				if (err) {
					return next(err);
				} else {
					find(req, res, next);
				}
			});
	})


router.route('/:id')
	.get(function(req,res,next){
		Item.find({deptCode: req.params.id.toUpperCase()})
			.sort({courseCode: 1})
			.select ('courseCode Name Description price quantity date uploader')
			.exec(function(err, items) {
				if (err) {
					return next(err);
				} else if (items === null ) {
					res.status(400).json({error: "Department not found!"});
				} else {
					res.status(200).json(items);
				}
			});
	});

function findList(req, res, next) {
	Item.find()
		.sort({deptCode: 1})
		.select ('deptCode courseCode Name Description price quantity date uploader')
		.exec(function(err, items) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(items);
			}
		});
}

function find(req, res, next) {
	Item.find().sort({deptCode: 1}).exec(function (err, items) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(items);
		}
	});	
}

module.exports = router;