"use strict";
var express = require('express');
var router = express.Router();
var Dept = require('../models/dept');
var Course = require('../models/course');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateTokenPartial(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		// see all dept
		findList(req, res, next);
	})

	.post(function(req, res, next) {
		// add a dept
		if (req.decoded.admin) {
			Dept.create({
				deptCode: req.body.deptCode.toUpperCase(),
				deptName: req.body.deptName,
			}, function(err) {
				if (err) {
					return next(err);
				} else {
					findList(req, res, next);
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to add a department!"});
		}
	});

router.route('/:id')
	.get(function(req, res, next) {
		// check dept info
		find(req, res, next);
	})

	.put(function(req, res, next) {
		// edit dept name
		if (req.decoded.admin) {
			Dept.update({deptCode: req.params.id.toUpperCase()}, 
				{$set: {deptName: req.body.deptName}},
				function (err) {
					if (err) {
						return next(err);
					} else {
						find(req, res, next);
					}
				}
			);
		} else {
			res.status(401).json({error: "You are not authorized to edit a department!"});
		}
	})

	.delete(function(req, res, next) {
		// delete dept
		if (req.decoded.admin){
			Dept.findOne({deptCode: req.params.id.toUpperCase()}, function(err, dept) {
				if (err) {
					return next(err);
				} else if (dept === null) {
					res.status(400).json({error: "Department not found!"});
				} else {
					dept.remove();
					findList(req, res, next);			
				}
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a department!"});
		}
	});

function findList(req, res, next) {
	Dept.find()
		.sort({deptCode: 1})
		.select('deptCode deptName')
		.exec(function(err, depts) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(depts);
			}
		});
}

function find(req, res, next) {
	Dept.findOne({deptCode: req.params.id.toUpperCase()},
		function(err, dept) {
			if (err) {
				return next(err);
			} else if (dept === null) {
				res.status(400).json({error: "Department not found!"});
			} else {
				res.status(200).json(dept);
			}
		}
	);
}

module.exports = router;