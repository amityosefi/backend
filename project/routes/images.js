const express = require("express");
const router = express.Router();
const images_utils = require("./utils/images_utils");



router.get('/getImages/:category/:numbers', async function(req, res) {
  try {
    const category = req.params.category;
    const numbers = req.params.numbers;

    if (!category || isNaN(numbers) || category >= 8) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await images_utils.getAllPictures(category, numbers);
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

module.exports = router;
