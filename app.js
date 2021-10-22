const express = require('express');
const bodyParser = require('body-parser');
const app_utils = require("./app_utils");
const db_utils = require("./db_utils");
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



app.post('/login', async function(req, res) {

  try {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !(password)) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await app_utils.getDBs(username, password);
    // const ans = await db_utils.getDB(username, password);
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

// app.post('/check', async function(req, res) {
//
//   try {
//     const username = req.body.username;
//     const password = req.body.password;
//     if (!username || !(password)) {
//       res.status(400).send({ message: 'Wrong inputs' });
//     }
//     const ans = await db_utils.getDB(username, password);
//     res.status(200).send(ans);
//
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({message: new Error(err)});
//   }
// });




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



const port = '8110';
const host = '0.0.0.0'

const server = app.listen(port, host, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at ' + host + ":" + port + '\n')
})

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});


module.exports = app

