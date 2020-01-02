var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/send');

var app = express();
var MongoClient = require("mongodb").MongoClient;
var ConnectionURL = "mongodb://{username}:{password}@{host}:{port}/{database}";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var Database = "kalvin-workshop-topic-2";
var User = "Kalvin";
var Password = "KalvinChang2020";
ConnectionURL = ConnectionURL.replace("{host}", "173.230.155.191")
    .replace("{port}", "27017")
    .replace("{username}", User)
    .replace("{password}", Password)
    .replace("{database}", Database);

MongoClient.connect(
    ConnectionURL,
    function (err, client) {
      app.locals.db = client.db(Database).admin();

      app.use(function(req, res, next) {
        next(createError(404));
      });

      app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
      });

    }
);

module.exports = app;
