'use strict';

// Module: Utils
// Purpose: 
// 	This module contains methods which are commonly used.
// Interface:
// 	validateToken: check if the request contains a token. If no token, force log out
// 	validateTokenPartial: check if the request contains a token, but don't force log out
// 		if no token
// 	findUser: decode token (for socket's use)
// 	addPoint: add points to a user
// 	deductPoint: deduct points from a user
// 	informUser: send an update message to a user
// 	informAdmin: send an update message to all admin

module.exports = {
	//--------------------------------------------------------------------------
	// Name: validateToken
	// Purpose: check if the request contains a token. If no token, force log out
	// Input: token
	// Output: a decoded token
	// Implementation:
	// 	check if the request contains a token
	// 	if true, try to decode it
	// 	otherwise, send an 401 error which forces user to log out
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

	//--------------------------------------------------------------------------
	// Name: validateTokenPartial
	// Purpose: check if the request contains a token, but don't force log out
	// 	if no token
	// Input: token
	// Output: a decoded token
	// Implementation:
	// 	check if the request contains a token
	// 	if true, try to decode it and execute next middleware
	// 	otherwise, ignore it and execute next middleware
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

	//--------------------------------------------------------------------------
	// Name: findUser
	// Purpose: decode token (for socket's use)
	// Input: token, callback
	// Output: a decoded token
	// Implementation:
	// 	check if the request contains a token
	// 	if true, try to decode it and execute next callback
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

	//--------------------------------------------------------------------------
	// Name: addPoint
	// Purpose: add points to a user
	// Input: user id, point, callback
	// Output: none
	// Implementation:
	// 	find the user in database. If successful, add points to the user and
	// 	execute next callback
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

	//--------------------------------------------------------------------------
	// Name: deductPoint
	// Purpose: deduct points to a user
	// Input: user id, point, callback
	// Output: none
	// Implementation:
	// 	find the user in database. If successful, deduct points to the user and
	// 	execute next callback
	deductPoint: function(uid, point, callback) {
		var User = require('./models/user');

		User.findOneAndUpdate({uid: uid}, {$inc: {points: -point}}, function(err) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	},

	//--------------------------------------------------------------------------
	// Name: informUser
	// Purpose: send an update message to a user
	// Input: user id, message, callback
	// Output: none
	// Implementation:
	// 	find the user in database. If successful, push the update message to the
	// 	user and execute next callback
	informUser: function(uid, message, callback) {
		var User = require('./models/user');

		User.findOneAndUpdate({uid: uid}, {$push: {updates: message}}, function(err) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	},

	//--------------------------------------------------------------------------
	// Name: informAdmin
	// Purpose: send an update message to all admin
	// Input: message, callback
	// Output: none
	// Implementation:
	// 	find all admin in database. If successful, push the update message to all
	// 	the admin and execute next callback
	informAdmin: function(message, callback) {
		var User = require('./models/user');

		User.update({admin: true}, {$push: {updates: message}}, function(err) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	}
};