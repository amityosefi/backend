const db_utils = require('./routes/utils/db_utils');
const axios = require("axios");
require("dotenv").config({path:'.env'});
const express = require('express');
const bodyParser = require('body-parser');
var path = require("path");
const session = require("client-sessions");
var logger = require("morgan");
var cors = require("cors");

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

const port = '443';
const host = '0.0.0.0'

const auth = require("./routes/auth");
const images = require("./routes/images");

app.use("/images", images);
app.use(auth);
// const pictures = require("./routes/pictures");



// app.get('/images/:number', async function(req, res) {
//   try {
//     const number = req.params.number;
//     if (!number || isNaN(number)) {
//       res.status(400).send({ message: 'Wrong inputs' });
//     }
//     const ans = await app_utils.getImages(number);
//     res.status(200).send(ans);

//   } catch (err) {
//     console.log(err);
//     res.status(500).send({message: new Error(err)});
//   }
// });

// app.post('/images/timestamp', async function(req, res) {
//   try {
//     let diff = req.body.diff;
//     let url = req.body.PicURL;
//     // await db_utils.SubmitTimeDiff(diff,url);
//     res.status(200).send("added successfully");

//   } catch (err) {
//     console.log(err);
//     res.status(500).send({message: new Error(err)});
//   }
// });


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

