const express = require('express');
const bodyParser = require('body-parser');
var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/testDatabase";

MongoClient.connect(url, function(err, db) {
    try{
        var dbo = db.db("testCollection");
        dbo.createCollection("testCollection", function(err, res) {
          console.log("Collection created!");
          db.close();
        });
    }
    catch{
        console.error('error connecting to database');
    }
});

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));