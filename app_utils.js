const puppeteer = require('puppeteer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require("path");

let counter = 0;
const genericPathImage = 'assets/webimage';
const genericPathMp4 = 'assets/webmp4';

async function urlToScreenshot(adr) {
    try{
    const path_for_image = `${genericPathImage}${counter.toString()}.jpg`;
    const browser = await puppeteer.launch();
    let page = await browser.newPage();
    page.setViewport({ width: 2000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(adr);
    await page.screenshot({ path: path_for_image });
    await browser.close();
    return path_for_image;
    }catch (err){
        throw new Error(err);
    }
}

function convert(input, output, callback) {
    ffmpeg(input)
        .output(output)
        .inputFPS(1)
        .outputFPS(30)
        .videoCodec('libx264')
        .videoBitrate(1024)
        .size('640x?')
        .loop(10)
        .noAudio()
        .on('end', function() {                    
            callback(null);
        })
        .on('error', function(err){
            callback(err);
        })
        .run();
}


function imageToMp4(path_for_image) {
    const path_to_mp4 = `${genericPathMp4}${counter.toString()}.mp4`;
    ffmpeg.setFfmpegPath(ffmpegPath);

    return new Promise((resolve, reject) => {
        convert(path_for_image, path_to_mp4, function(err){
            if (!err) {
                resolve(path_to_mp4);
            } else {
                reject('error in convesrion of image to mp4', err);
            }
         });
    });
}

function deleteImage(path_for_image) {
    try {
        fs.unlinkSync(path_for_image);
    } catch (err) {
        throw new Error(err);
    }

}

async function setFunc(url) {
    try{
    const imapgePath = await urlToScreenshot(url);
    const mp4Path = await imageToMp4(imapgePath);
    deleteImage(imapgePath);

    counter += 1;
    const absolutePath = path.resolve(mp4Path);
    return { file: absolutePath };
    }catch(err){
        throw err;
    }
}

exports.setFunc = setFunc;