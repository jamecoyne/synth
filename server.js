const express = require('express');
const bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Users = require('./src/database_js/users/user');
const { hasOnlyExpressionInitializer } = require('typescript');

//var MongoClient = require('mongodb').MongoClient;
var url = "";

mongoose.connect(url, {
  useNewUrlParser : true,
  useFindAndModify : true,
  useUnifiedTopology : true,
  useCreateIndex : true,
});

var database = mongoose.connection;

database.once('open', async () => {
  console.log('Connected to database');
  database.useDb('synthbase');
});

database.on('error', () => {
    console.log('Error connecting to database!');
});

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//save a sequence
app.post('/api/tbsave', async (req, res) => {
  console.log('Saving table...');
  //assemble table here?
  var jane = await Users.findOne({username : req.body.username});
  jane.addSequence({
    name : req.body.seq_name,
    table : req.body.seq_table
  })
  res.send('Table saved!');
});

//create a user
app.post('/api/createuser', async (req, res) => {
  console.log('Creating user...');
  Users.create({
    username: req.body.un,
    password: '12345'
  });
  //pretend to send a confirmation email w/ password reset link or whatever
  res.send('User successfully created!')
});

//save an instrument preset
app.post('/api/saveinst', async (req, res) => {
  console.log('Saving instrument...');
  var user = await Users.findOne({username : req.body.username});
  console.log('Instrument being saved : ');
  user.addInstPreset(req.body);
  res.send('Instrument saved!')
});

//load a sequence
app.post('/api/tbload', async (req, res) => {
  console.log('Finding sequence...')
  var seq = await Users.findOne({username : req.body.username});
  res.send(seq.sequences.get(req.body.seq_name));
});

//load an instrument preset
app.post('/api/loadinst', async (req, res) => {
  console.log('Finding instrument preset...')
  var inst = await Users.findOne({username : req.body.username}).inst_presets.get(req.body.seq_name);
  res.send(inst);
})

app.listen(port, () => console.log(`Listening on port ${port}`));