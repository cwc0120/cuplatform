"use strict";
var express = require('express');
var router = express.Router();
var Course = require('../models/course');
var Dept = require('../models/dept');
var utils = require('../utils');

router.use(function(req, res, next) {
	utils.validateToken(req, res, next);
});

router.route('/')
	.get(function(req, res, next) {
		findList(req, res, next);
	})

	.post(function(req, res, next) {
		if (req.decoded.admin) {
			Course.create({
				courseCode: req.body.courseCode,
				courseName: req.body.courseName,
				deptCode: req.body.deptCode,
				term: ,
				schedule: [{
					day: Number,
					lesson: Number,
					venue: String 
				}]
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
	})

router.route('/:id')
	.get(function(req, res, next) {
		Course.findOne({_id: req.params.id}, function(err, course) {
			if (err) {
				next(err);
			} else if (course == undefined) {
				res.status(400),json({error: "Course not found!"});
			} else {
				res.status(200).json(course);
			}
		});
	})

	.put(function(req, res, next) {
		
	})

function findList(req, res, next) {
	Course.find()
		.sort({courseCode: 1})
		.select('courseCode courseName')
		.exec(function(err, courses) {
			if (err) {
				return next(err);
			} else {
				res.status(200).json(courses);
			}
		});
}

function find(req, res, next) {
	Course.findOne({_id: req.params.id}, function(err, course) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(course);
		}
	});
}