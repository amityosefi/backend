
const express = require('express');
const bodyParser = require('body-parser');
const app_utils = require("./app_utils");
require("dotenv").config({path:'.env'})
// declare a new express app
const app = express();
app.use(bodyParser.json());

app.get('/', async function(req, res) {
  res.status(200).send("url to mp4 server is running");
});

app.post('/converter', async function(req, res) {
  try {
    const url = req.body.url;
    if (!url) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await app_utils.setFunc(url);
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});


const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`App started listen on port ${port}`);
});

module.exports = app

