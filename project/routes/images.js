const express = require("express");
const router = express.Router();
const images_utils = require("./utils/images_utils");

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


router.get('/checkCompress', async function(req, res) {

  try {
    
    
    var folder = 'C:\\Users\\user\\Desktop\\Image Preference Project\\';
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

    res.status(200).send(files);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

module.exports = router;
