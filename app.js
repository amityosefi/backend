const express = require('express');
const bodyParser = require('body-parser');
const app_utils = require("./app_utils");
require("dotenv").config({path:'.env'})
const app = express();
app.use(bodyParser.json());

app.get('/', async function(req, res) {
  res.status(200).send("server is running");
});

app.post('/images/:number', async function(req, res) {
  try {
    const number = req.body.number;
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


const port = process.env.PORT || 3001;

app.listen(port, function() {
    console.log(`App started listen on port ${port}`);
});

module.exports = app

