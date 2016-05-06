'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');

var app = express();
mongoose.connect(config.database);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/node', express.static(path.join(__dirname, '/node_modules')));
app.use(express.static(path.join(__dirname, 'public')));
app.set('secret', config.secret);

var auth = require('./routes/auth');
var register = require('./routes/register');
var dept = require('./routes/dept');
var course = require('./routes/course');
var item = require('./routes/item');
var resource = require('./routes/resource');
var thread = require('./routes/thread');
var user = require('./routes/user');

app.use('/api/auth', auth);
app.use('/api/register', register);
app.use('/api/dept', dept);
app.use('/api/course', course);
app.use('/api/item', item);
app.use('/api/resource', resource);
app.use('/api/thread', thread);
app.use('/api/user', user);

app.get('*', function(req, res) {
  res.sendFile('/public/views/index.html', {root : __dirname});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      error: err.message,
      errorObj: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: err.message,
    errorObj: {}
  });
});


module.exports = app;
