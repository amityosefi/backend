const db_utils = require("./db_utils");
const admin_utils = require("../utils/admin_utils");


const topic_names = ['Beach', 'Cities', 'Flowers', 'Forest', 'Mountain', 'Nature', 'Noam_s images', 'Universe'];
var fs = require('fs');

async function getRandomcategories(categories) {
    let arr = [];
    while (categories > 0) {
        let rand = Math.floor(Math.random() * 8); // 8 is the number of topics right now
        if (arr.includes(topic_names[rand]))
            continue;
        arr.push(topic_names[rand]);
        categories--;
    }
    return arr;
}



async function getRandomPictures(sql_query, numbers) {
    const max = sql_query.length; // max images in this category
    let arr = [];
    while (numbers > 0) {
        let r = Math.floor(Math.random() * max);
        if (!arr.includes(sql_query[r])) {
            arr.push(sql_query[r].Id, sql_query[r].Url);
            numbers--;
        }
    }
    return arr;
}
async function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

async function getAllPictures(categories, numbers) {

    let all_url_pictures = [];
    let full_details;
    const selected_categories = await getRandomcategories(categories);
    for (let i = 0; i < selected_categories.length; i++) {
        const sql_query = await db_utils.execQuery(`select Id, Url from dbo.images where Category = '${selected_categories[i]}'`);
        const url_pictures = await getRandomPictures(sql_query, numbers);

        all_url_pictures.push(url_pictures);

    }
    const mergedArrays = [].concat.apply([], all_url_pictures);
    let returnArr = [];
    let tmp = [];
    for (var i = 0; i < mergedArrays.length; i += 2) {
        dict = { id: mergedArrays[i], src: fs.readFileSync(mergedArrays[i + 1], 'base64') }
        returnArr.push(dict);
    }
    return { urls: returnArr };

}

async function insertRatings(user_id, pict_ratings) {
    if (pict_ratings.length >= 4) { // 72
        for (let i = 0; i < pict_ratings.length; i++) {
            let pic  = pict_ratings[i];
            let pic_id = pic.picId;
            let rating = pic.rating;
            const sql_query = await db_utils.execQuery(`INSERT INTO dbo.users_ratings (User_id, Pic_id, rating)
            VALUES ('${user_id}', '${pic_id}', '${rating}');`);
        }
        return "Insert success";
    }
    return "Insert fail";
}

async function getSecondGameImages(user_id) {
    let best_ratings = [];
    let worst_ratings = [];
    let counter = 10;
    const globalSettings = admin_utils.getGlobalSettings();
    const firstGameImagesSelected  = globalSettings.firstGameImagesSelected;
    const firstGameImages  = globalSettings.firstGameImages - firstGameImagesSelected;

    while (best_ratings.length < firstGameImagesSelected) { // 25% of 72 pictures = 18
        let x = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        best_ratings = best_ratings.concat.apply(best_ratings, x);
        counter -= 1;
    }
    if(best_ratings.length > firstGameImagesSelected)
    {
        best_ratings.slice(0,firstGameImagesSelected);
    }
    counter = 0;
    while (worst_ratings.length < firstGameImages) { // 50% of 72 pictures = 36
        let y = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        worst_ratings = worst_ratings.concat.apply(worst_ratings, y);
        counter += 1;
    }
    if(best_ratings.length > firstGameImages)
    {
        best_ratings.slice(0,firstGameImages);
    }
    // console.log(best_ratings.length); // needs to be more than 18
    // console.log(worst_ratings.length); // needs to be more than 36

    best_ratings = await getRandomImages(best_ratings, firstGameImagesSelected);
    worst_ratings = await getRandomImages(worst_ratings, firstGameImages);

    best_ratings = await getUrlImages(best_ratings);
    worst_ratings = await getUrlImages(worst_ratings);

    return { best: best_ratings, worst: worst_ratings };
}

async function getRandomImages(arr_ratings, count) {
    const len = arr_ratings.length;
    const arr_random = [];
    const arr_res = [];
    while (arr_res.length < count) {
        let rand = Math.floor(Math.random() * len);
        if (!arr_random.includes(rand))
            arr_res.push(arr_ratings[rand]);
        arr_random.push(rand);
    }
    return arr_res;
}

async function getUrlImages(arr) {
    res = [];
    for (let i = 0; i < arr.length; i++) {
        let img = await db_utils.execQuery(`select Url from dbo.images where Id = '${arr[i].Pic_id}'`);
        let tmp = fs.readFileSync(img[0].Url , 'base64');
        pic = { 
            id: arr[i].Pic_id, 
            src:  tmp
        };
        res.push(pic);
    }
    return res;
}

async function setFirstGameResults(user_id, score, result){
    console.log(String(result));
    const firstGameImages = admin_utils.getGlobalSettings().firstGameImages;

    db_utils.execQuery(`INSERT INTO dbo.users_firstGame (id, score, outof, goodImages) VALUES ('${user_id}', '${score}','${firstGameImages}', '${String(result)}');`)
}


exports.setFirstGameResults = setFirstGameResults;
exports.insertRatings = insertRatings;
exports.getAllPictures = getAllPictures;
exports.getSecondGameImages = getSecondGameImages;
