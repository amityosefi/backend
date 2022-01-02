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


app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: 'ShaharDanielAmit', // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 20 sec
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration,
    cookie: {
      httpOnly: false,
    },
    //the session will be extended by activeDuration milliseconds
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

// middleware to serve all the needed static files under the dist directory - loaded from the index.html file
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));




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


app.use(function (req, res, next) {
  console.log("req",req.session)
  if (req.session && req.session.user_id) {
    db_utils.execQuery("SELECT Id FROM users")
      .then((users) => {
        if (users.find((x) => x.Id === req.session.user_id)) {
          req.user_id = req.session.user_id;
        }
        next();
      })
      .catch((error) => next());
  } else {
    next();
  }
});


app.use("/images", images);
app.use(auth);


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

