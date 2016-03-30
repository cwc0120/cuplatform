"use strict";
var express = require('express');
var router = express.Router();
var Dept = require('../models/dept');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
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

router.route('/:did')
	.get(function(req, res, next) {
		// check dept info
		find(req, res, next, function(dept) {
			res.status(200).json(dept);
		});
	})

	.put(function(req, res, next) {
		// edit dept name
		if (req.decoded.admin) {
			find(req, res, next, function(dept) {
				dept.update({$set: {deptName: req.body.deptName}}, function (err) {
					if (err) {
						return next(err);
					} else {
						findList(req, res, next);
					}
				});
			});
		} else {
			res.status(401).json({error: "You are not authorized to edit a department!"});
		}
	})

	.delete(function(req, res, next) {
		// delete dept
		if (req.decoded.admin) {
			find(req, res, next, function(dept) {
				dept.remove().exec(function(err) {
					if (err) {
						next(err);
					} else {
						findList(req, res, next);
					}
				});
			});
		} else {
			res.status(401).json({error: "You are not authorized to delete a department!"});
		}
	});

function findList(req, res, next) {
	Dept.find()
		.select('deptCode deptName')
		.exec(function(err, depts) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(depts);
			}
		});
}

function find(req, res, next, callback) {
	Dept.findOne({deptCode: req.params.did.toUpperCase()},
		function(err, dept) {
			if (err) {
				return next(err);
			} else if (dept === null) {
				res.status(400).json({error: "Department not found!"});
			} else {
				callback(dept);
			}
		}
	);
}

module.exports = router;