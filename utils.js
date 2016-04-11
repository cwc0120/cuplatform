'use strict';

module.exports = {
	validateToken: function(req, res, next) {
		var jwt = require('jsonwebtoken');
		var token = req.headers['x-access-token'];

		if (token) {
			jwt.verify(token, req.app.get('secret'), function(err, decoded) {
				if (err) {
					return res.status(401).json({error: err.name + ': ' + err.message});
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			return res.status(401).json({error: 'No token provided.'});
		}
	},

	validateTokenPartial: function(req, res, next) {
		var jwt = require('jsonwebtoken');
		var token = req.headers['x-access-token'];

		if (token) {
			jwt.verify(token, req.app.get('secret'), function(err, decoded) {
				if (err) {
					return res.status(401).json({error: err.name + ': ' + err.message});
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			next();
		}
	},

	findUser: function(token, callback) {
		var config = require('./config');
		var jwt = require('jsonwebtoken');

		if (token) {
			jwt.verify(token, config.secret, function(err, decoded) {
				if (err) {
					callback(err);
				} else {
					callback(err, decoded);
				}
			});
		}
	},

	addPoint: function(uid, point, callback) {
		var User = require('./models/user');

		User.findOneAndUpdate({uid: uid}, {$inc: {points: point}}, function(err) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	},

	deductPoint: function(uid, point, callback) {
		var User = require('./models/user');

		User.findOneAndUpdate({uid: uid}, {$inc: {points: -point}}, function(err) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	}
};