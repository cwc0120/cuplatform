"use strict";
var express = require('express');
var router = express.Router();
var Dept = require('../models/dept');
var utils = require('../utils');

router.use(function(req, res, next) {
	// require a valid token for part of this route
	utils.validateTokenPartial(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		// see all dept
		findList(req, res, next);
	})

	.post(function(req, res, next) {
		// add a dept
		// check if the user is an admin
		if (req.decoded.admin) {
			// create a new department using the department code and name provided
			Dept.create({
				deptCode: req.body.deptCode.toUpperCase(),
				deptName: req.body.deptName,
			}, function(err) {
				if (err) {
					return next(err);
				} else {
					// return the list of departments
					findList(req, res, next);
				}
			});
		} else {
			//raise error if the user is not an admin
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
		// check if the user is an admin
		if (req.decoded.admin) {
			// find the corresponding department with the department id and update it with the new name
			find(req, res, next, function(dept) {
				dept.update({$set: {deptName: req.body.deptName}}, function (err) {
					if (err) {
						return next(err);
					} else {
						// return the list of departments
						findList(req, res, next);
					}
				});
			});
		} else {
			// raise error if user is not an admin
			res.status(401).json({error: "You are not authorized to edit a department!"});
		}
	})

	.delete(function(req, res, next) {
		// delete dept
		// check if the user is an admin
		if (req.decoded.admin) {
			// find the corresponding department and remove it, return the list of department afterwards
			find(req, res, next, function(dept) {
				dept.remove();
				findList(req, res, next);
			});
		} else {
			// raise error if user is not an admin
			res.status(401).json({error: "You are not authorized to delete a department!"});
		}
	});

function findList(req, res, next) {
	// find the list of departments
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
	// find a department given a department code
	Dept.findOne({deptCode: req.params.did.toUpperCase()},
		function(err, dept) {
			if (err) {
				return next(err);
			} else if (dept === null) {
				// raise error if department cannot be found
				res.status(400).json({error: "Department not found!"});
			} else {
				callback(dept);
			}
		}
	);
}

module.exports = router;