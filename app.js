const express = require('express');
const bodyParser = require('body-parser');
const app_utils = require("./app_utils");
// const db_utils = require("./db_utils")
var path = require("path");
const session = require("client-sessions");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config({path:'.env'})
const app = express();
app.use(bodyParser.json());

app.get('/', async function(req, res) {
  res.status(200).send("server is running");
});

app.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});

const corsConfig = {
  origin: true,
  credentials: true,
  
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

app.get('/images/:number', async function(req, res) {
  try {
    const number = req.params.number;
    if (!number || isNaN(number)) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await app_utils.getImages(number);
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

app.get('/images/:topics/:numbers', async function(req, res) {
  try {
    const topics = req.params.topics;
    const numbers = req.params.numbers;

    if (!topics || isNaN(numbers) || topics >= 8) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await app_utils.getAllPictures(topics, numbers);
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

app.post('/images/timestamp', async function(req, res) {
  try {
    let diff = req.body.diff;
    let url = req.body.PicURL;
    // await db_utils.SubmitTimeDiff(diff,url);
    res.status(200).send("added successfully");

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});



const port = process.env.PORT || 3001;

app.listen(port, function() {
    console.log(`App started listen on port ${port}`);
});

module.exports = app

