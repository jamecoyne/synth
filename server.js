const express = require("express");
const bodyParser = require("body-parser");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var Users = require("./src/database_js/users/user");
const { hasOnlyExpressionInitializer } = require("typescript");
const { response } = require("express");
const { json } = require("body-parser");

//var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

mongoose.connect(url, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

var database = mongoose.connection;

database.once("open", async () => {
  console.log("Connected to database");
  database.useDb("synthbase");
});

database.on("error", () => {
  console.log("Error connecting to database!");
});

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//save a sequence
app.post("/api/tbsave", async (req, res) => {
  console.log("Saving table...");
  //assemble table here?
  var jane = await Users.findOne({ username: req.body.username });
  jane.addSequence({
    name: req.body.seq_name,
    table: req.body.seq_table,
  });
  res.send("Table saved!");
});

//create a user
app.post("/api/createuser", async (req, res) => {
  console.log("Creating user...");
  //make sure the username isn't taken
  var curruser = Users.findOne({ username: req.body.un });
  if (curruser != undefined) {
    Users.create({
      username: req.body.un,
      password: req.body.pw,
    });
    //pretend to send a confirmation email w/
    res.send("User successfully created!");
  } else {
    res.send("Username taken!");
  }
});

//login
app.post("/api/login", async (req, res) => {
  console.log("Logging in as " + req.body.un);
  var curruser = Users.findOne({ username: req.body.un });
  if (curruser == undefined) {
    res.send("User does not exist");
  }
  if (curruser.password == req.password) {
    console.log("Login successful!");
    res.send("Login successful!");
  } else {
    console.log("Password incorrect!");
    res.send("Password incorrect!");
  }
});

//save an instrument preset
app.post("/api/saveinst", async (req, res) => {
  console.log("Saving instrument...");
  var user = await Users.findOne({ username: req.body.username });
  console.log("Instrument being saved : ");
  user.addInstPreset(req.body);
  res.send("Instrument saved!");
});

//load a sequence
app.post('/api/tbload', async (req, res) => {
  console.log('Finding sequence...')
  var seq = await Users.findOne({username : req.body.username});
  if(seq === undefined)
  {
    console.log('User doesnt exist!');
    return;
  }
  res.send(seq.sequences.get(req.body.seq_name));
});

//load an instrument preset
app.post('/api/loadinst', async (req, res) => {
  console.log('Finding instrument preset...');
  var inst = await Users.findOne({username : req.body.username});
  res.send(inst.inst_presets.get(req.body.preset_name));
});

//get list of user sequences for client UI
app.post('/api/getseqlist', async (req, res) => {
  console.log('Getting user sequences...');
  var user = await Users.findOne({username : req.body.username});
  //check if user is real (though if this method is being called by the client, then the user should already be logged in)
  if(user !== undefined)
  {
    seqs = user.getSequences();
    res.send(seqs);
  } else {
    res.send('User not found!');
  }
});

//get list of user instruments for client UI
app.post('/api/getinstlist', async (req, res) => {
  console.log('Getting user instruments...');
  var user = await Users.findOne({username : req.body.username});
  //check if user is real (though if this method is being called by the client, then the user should already be logged in)
  if(user !== undefined)
  {
    insts = user.getInstruments();
    res.send(insts);
  } else {
    res.send('User not found!');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
