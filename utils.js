'use strict';

module.exports = {
	validateToken: function(req, res, next) {
		var jwt = require('jsonwebtoken');
		var token = req.headers['x-access-token'];

		if (token) {
			jwt.verify(token, req.app.get('secret'), function(err, decoded) {
				if (err) {
					return res.status(400).json({message: err.name + ': ' + err.message});
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			return res.status(403).json({message: 'No token provided.'});
		}
	}
};