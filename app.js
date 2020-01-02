var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hash = require("./util/hash");

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
      var db = client.db(Database).admin();
      app.locals.db = db;

      var collection = db.collection("data");

      app.get("/:id", function(req, res) {
          collection.find({
              "shortened-id": req.params.id.toLowerCase()
          }).toArray(function (err, result) {
              if (err != null) {
                  res.status(404);
              } else {
                  var url = result[0]["original-url"];
                  if (url == null) {
                      res.status(404);
                      res.render("./public/404.html") //For example
                  } else {
                      res.redirect(301, url);
                  }
              }
          })
      });

      app.post("/api/shorten-url", (function (req, res) {
          var originalURL = req.body["original-url"];
          var urlId = req.body["customized-id"];

          if (urlId == null) {
              var hashedURL = hash.hash(originalURL);
              var rangeMin = Math.random() * (hashedURL.length - 7);
              urlId = hashedURL.substring(rangeMin, rangeMin + 7);
          } else {
              (collection.find({
                  "url-id": urlId
              }), function (err, result) {
                  if (result != null) {
                      urlId = null;
                  }
              });
          }


          var document = {
              "original-url": originalURL,
              "shortened-id": urlId
          };

          if (urlId != null) {
              collection.insertOne(document, {}, function (err, result) {
                  if (err != null) {
                      res.status(500);
                      return;
                  }

                  res.status(200);
                  console.log("Document inserted");
              });
          } else {
              res.status(402);
          }

      }));

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

app.listen(8000);

module.exports = app;
