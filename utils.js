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
					console.log("The following user has been verified:");
					console.log(decoded);
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
					console.log("The following user has been verified:");
					console.log(decoded);
					next();
				}
			});
		} else {
			next();
		}
	},

	findUser: function(token, callback) {
		var config = require('./config')
		var jwt = require('jsonwebtoken');

		if (token) {
			jwt.verify(token, config.secret, function(err, decoded) {
				if (err) {
					callback(err);
				} else {
					callback(err, decoded.uid);
				}
			});
		}
	}
};