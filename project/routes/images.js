const express = require("express");
const router = express.Router();
const images_utils = require("./utils/images_utils");
const auth_utils = require("./utils/auth_utils");
const admin_utils = require("./utils/admin_utils");

// const imagemin = require('imagemin');
// const imageminJpegtran = require('imagemin-jpegtran');
// const imageminPngquant = require('imagemin-pngquant');

// import imagemin from 'imagemin';
// import imageminJpegtran from 'imagemin-jpegtran';
// import imageminPngquant from 'imagemin-pngquant';
const db_utils = require("./utils/db_utils");
//const fs = require('fs');
const resizeImg = require('resize-image-buffer');
let decode = require('image-decode')
let encode = require('image-encode')
const imageToBase64 = require('image-to-base64');
var fs = require('fs');
var LZUTF8 = require('lzutf8');
const Jimp = require("jimp");

const path = require('path');

const zlib = require('zlib');
var FileReader = require('filereader');


/**
 * Authenticate all incoming requests by middleware
 */
//  router.use(async function (req, res, next) {
//   if (req.headers.user_id) {
//     db_utils.execQuery("SELECT Email FROM dbo.users")
//       .then((users) => {
//         if (users.find((x) => x.Email === req.headers.user_id)) {
//           req.user_id = req.headers.user_id;
//           next();
//         }
//       })
//       .catch((err) => next(err));
//   } else {
//     res.sendStatus(401);
//   }
// });



router.get('/getImages', async function(req, res) {
  try {

    const globalSettings = admin_utils.getGlobalSettings();
    const category = 8;
    const numbers =  Math.floor(globalSettings.rankImages / category);

    const ans = await images_utils.getAllPictures(category, numbers);
    this.image_arr = ans;
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});



router.get('/checkCompress', async function(req, res) {

  try {
    
    
    var folder = 'C:\\Images\\Images\\';
    var files = fs.readdirSync(folder);

    for(var i = 0 ; i < files.length ; i++)
    {
      // console.log(files[i]);
      
      var images = fs.readdirSync(folder+files[i]+"\\");
      for(var j = 0 ; j < images.length ; j++)
      {
        var path = folder+files[i]+"\\"+images[j];
        await db_utils.execQuery(`insert into dbo.Images(Url,Nature,Day,Urban,Wildlife,Space,Sunset,Beach,Category) values ('${path}',0,0,0,0,0,0,0,'${files[i]}')`);
      }
    }
    // for(var i = 0 ; i < files.length ; i++)
    // {
    //   let data = folder+'Animals\\'+files[i];
      
    //   
      
        
    // }
    
    // const gzip = zlib.createGzip();

    // const inp = fs.createReadStream(data);
    // const out = fs.createWriteStream(data+".qz");
    // inp.pipe(gzip).pipe(out);

    // console.log(inp);
    // console.log("----------");
    // console.log(out);

    // var unzip = zlib.createUnzip();

    // var read = fs.createReadStream(data+".qz");
    // var write = fs.createWriteStream('unzip-test.txt');
    // //Transform stream which is unzipping the zipped file
    // read.pipe(unzip).pipe(write);
    // console.log("Decompressed");
                                
    


    // const base64 = fs.readFileSync(data, "base64");
    // console.log(base64);
    // console.log("stop");
    //Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 ...
    // const buffer = Buffer.from(base64, "base64");

    // fs.writeFileSync("new-path.jpg", buffer);
    
    // for(var i = 1; i <= 72; i++)
    // {
    //   let picId = Math.floor(Math.random()*250)+1001;
    //   await db_utils.execQuery(`insert into [dbo].[user_rating](uid,Picid,rating) values(1,${picId},6)`);
    
    // }
    // for(var i = 1; i <= 72; i++)
    // {
    //   let picId = Math.floor(Math.random()*250)+1001;     
     
    //   await db_utils.execQuery(`insert into [dbo].[user_rating](uid,Picid,rating) values(4,${picId},8)`);
     
    // }
    // for(var i = 1; i <= 72; i++)
    // {
    //   let picId = Math.floor(Math.random()*250)+1001;
    //   let rand_rate = Math.floor(Math.random()*10)+1;
    //   await db_utils.execQuery(`insert into [dbo].[user_rating](uid,Picid,rating) values(5,${picId},${rand_rate})`);
    // }

    res.status(200).send(files);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

router.post('/submitRatings', async function(req, res) {
  try {
    const user_id = req.body.id;

    const pict_ratings = req.body.data_ratings;
    const ans = await images_utils.insertRatings(user_id, pict_ratings);
    res.status(200).send(ans);
} catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
}
});

router.post('/getSecondGameImages', async function(req, res){
  try {
    const user_id = req.body.id;
    const ans = await images_utils.getSecondGameImages(user_id);
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

router.post('/getSecondGameImagesOtherPerson', async function(req, res){
  try {
    const user_id = req.body.id;
    const other_id = await images_utils.getOtherUserId(user_id);
    const ans = await images_utils.getSecondGameImages(other_id);
    res.status(200).send( {other_id: other_id, ans});

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});


router.post('/submitFirstGame', async function(req, res){
  try {
    const user_id = req.body.id;
    const score = req.body.score;
    const result = req.body.result;
    const allImages = req.body.allImages;

    await images_utils.setFirstGameResults(user_id, score, result, allImages);
    res.status(200).send({message: "The results saved successfully"});

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

router.post('/fetchSpecificImages', async function(req, res){
  try {
    const pics = req.body.pics;
    const bins = req.body.bins;
    console.log("pics",pics)
    console.log("bins",bins)
    let ans = await images_utils.fetchImnages(pics,bins);
    
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});
router.post('/submitSecondGame', async function(req, res){
  try {
    const user_id = req.body.id;
    const other_id = req.body.other_id
    const score = req.body.score;
    const result = req.body.result;
    const allImages = req.body.allImages;

    await images_utils.setSecondGameResults(user_id, other_id, score, result, allImages);
    res.status(200).send({message: "The results saved successfully"});

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});


router.get('/amitCheck', async function(req, res) {

  try {

    let random_numbers_for_pics = [];
    for(var j = 0 ; j < 75 ; j++)
    {
      let random_num = Math.floor(Math.random() * 250);
      if (!random_numbers_for_pics.includes(random_num)){
        await db_utils.execQuery(`insert into dbo.users_ratings (User_id, Pic_id, rating) values (2, '${random_num}' , '${Math.floor(Math.random() * 10 + 1)}')`);
        random_numbers_for_pics.push(random_num);
      }
      else{
        j -= 1;
      }
    }
    const ans = await db_utils.execQuery(`select User_id from dbo.users_ratings`);
    res.status(200).send({mes: ans.length});

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});


router.get('/getLeaders', async function(req, res) {

  try {
    const leaders = await images_utils.getLeaders();
    res.status(200).send(leaders);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});



module.exports = router;
