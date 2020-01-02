var MongoClient = require("mongodb").MongoClient;
var ConnectionURL = "mongodb://{username}:{password}@{host}:{port}";

var db;

function loadDatabase(mongoConfig) {
    var Database = "kalvin-workshop-topic-2";
    var User = "Kalvin";
    var Password = "KalvinChang2020";
    ConnectionURL = ConnectionURL.replace("{host}", "173.230.155.191")
        .replace("{port}", "27017")
        .replace("{username}", User)
        .replace("{password}", Password);

    MongoClient.connect(
        ConnectionURL,
        function (err, client) {
            var db = client.db(Database).admin();
            app.locals.db = db;
            console.log("connected");
            if (err != null) {
                console.log(err);
            }
        }
    )
}