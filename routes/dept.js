"use strict";
var express = require('express');
var router = express.Router();
var Dept = require('../models/dept');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateTokenPartial(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		findList(req, res, next);
	})

	.post(function(req, res, next) {
		if (req.decoded.admin) {
			Dept.create({
				deptCode: req.body.deptCode,
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
		find(req, res, next);
	})

	.put(function(req, res, next) {
		Dept.update({_id: req.params.id}, 
			{$set: {deptCode: req.body.deptCode, deptName: req.body.deptName}},
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
		if (req.decoded.admin){
			
			Dept.remove(
				{_id: req.params.id},
				function(err) {
					if (err) {
						return next(err);
					} else {
						findList(req, res, next);
					}
				}
			);
		} else {
			res.status(401).json({error: "You are not authorized to add a department!"});
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
	Dept.findOne({_id: req.params.id}, function(err, dept) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(dept);
		}
	});
}

module.exports = router;