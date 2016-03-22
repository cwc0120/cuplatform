'use strict';

module.exports = {
	validateToken: function(req, res, next) {
		var jwt = require('jsonwebtoken');
		var token = req.headers['x-access-token'];

		if (token) {
			jwt.verify(token, req.app.get('secret'), function(err, decoded) {
				if (err) {
					return res.status(400).json({error: err.name + ': ' + err.message});
				} else {
					req.decoded = decoded;
					console.log("The following user has been verified:");
					console.log(decoded);
					next();
				}
			});
		} else {
			return res.status(403).json({error: 'No token provided.'});
		}
	},

	validateTokenPartial: function(req, res, next) {
		var jwt = require('jsonwebtoken');
		var token = req.headers['x-access-token'];

		if (token) {
			jwt.verify(token, req.app.get('secret'), function(err, decoded) {
				if (err) {
					return res.status(400).json({error: err.name + ': ' + err.message});
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.decoded = false;
			next();
		}
	}
};