const path = require("path");
const db_utils = require("./db_utils")

async function getImages(number) {
    const imgs = await db_utils.getTopImgs(number);
    return imgs;
}

exports.getImages = getImages;