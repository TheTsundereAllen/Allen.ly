var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hash = require("./util/hash");
var urlRegex = require('url-regex');

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
      var db = client.db(Database);
      app.locals.db = db;

      console.log("Connected");

      var collection = db.collection("data");

      app.get("/", function (req, res) {
          res.status(200);
          res.render("./public/index.html");
      });

      app.get("/:id", function(req, res) {
          if (req.params.length > 0) {
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
          }
      });

      app.post("/api/shorten-url", (function (req, res) {
          var originalURL = req.body["original-url"];

          if (!urlRegex({
              exact: true
          }).test(originalURL)) {
            res.status(400);
            res.send({
              code: 400,
              message: 'Bad Request',
              description: 'The URL specified is not a valid link'
            })
          } else {
              var urlId = req.body["customized-id"];

              if (urlId == null) {
                  var hashedURL = hash.hash(originalURL);
                  var rangeMin = Math.random() * (hashedURL.length - 7);
                  urlId = hashedURL.substring(rangeMin, rangeMin + 7);
              } else {
                  if (collection.find({
                    "shortened-id": urlId.trim()
                  })) {
                      res.status(400);
                      res.send({
                          code: 400,
                          message: 'Bad Request',
                          description: 'The specified id already exists'
                      })
                  }
              }

              while (collection.find({
                  "shortened-id": urlId.trim()
              })) {
                  hashedURL = hash.hash(originalURL);
                  rangeMin = Math.random() * (hashedURL.length - 7);
                  urlId = hashedURL.substring(rangeMin, rangeMin + 7);
              }

              var document = {
                  "original-url": originalURL,
                  "shortened-id": urlId.trim()
              };

              if (urlId != null) {
                  collection.insertOne(document, {}, function (err, result) {
                      if (err != null) {
                          res.status(500);
                          res.send({
                             code: 500,
                             message: 'Internal Server Error',
                             description: 'An internal server error has occurred, please try again or report it to the administrator'
                          });
                          return;
                      }

                      res.status(200);
                      res.send({
                          code: 200,
                          message: 'Execution Successful',
                          description: 'The URL has been successfully shortened and uploaded to the database',
                          original_url: document["original-url"],
                          shortened_id: document["shortened-id"]
                      });
                      console.log("Document inserted");
                  });
              } else {
                  res.status(400);
                  res.send({
                      code: 400,
                      message: 'Bad Request',
                      description: 'The ID of the URL is missing during the execution process'
                  })
              }
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
