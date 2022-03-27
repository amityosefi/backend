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

    while (best_ratings.length < firstGameImagesSelected * 4) {
        let x = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        best_ratings = best_ratings.concat.apply(best_ratings, x);
        counter -= 1;
    }
    if(best_ratings.length > firstGameImagesSelected)
    {
        best_ratings.slice(0,firstGameImagesSelected);
    }
    counter = 0;
    while (worst_ratings.length < firstGameImages * 4) {
        let y = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        worst_ratings = worst_ratings.concat.apply(worst_ratings, y);
        counter += 1;
    }
    if(best_ratings.length > firstGameImages)
    {
        best_ratings.slice(0,firstGameImages);
    }

    best_ratings = await getRandomImages(best_ratings, firstGameImagesSelected * 4);
    worst_ratings = await getRandomImages(worst_ratings, firstGameImages * 4);

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

async function setFirstGameResults(user_id, score, result, allImages){
    const firstGameImages = admin_utils.getGlobalSettings().firstGameImages;

    db_utils.execQuery(`INSERT INTO dbo.first_game_scores (user_id, score, max_score, goodImages, allImages, timestamp) VALUES ('${user_id}', '${score}','${firstGameImages}', '${String(result)}', '${String(allImages)}', '${String(new Date().toLocaleDateString())}');`)
}

async function setSecondGameResults(user_id, other, score, result, allImages){
    const firstGameImages = admin_utils.getGlobalSettings().firstGameImages;
    // console.log(user_id)
    // console.log(other)
    // console.log(score)
    // console.log(firstGameImages)
    // console.log(String(result))
    // console.log(String(allImages))
    // console.log(String(new Date().toLocaleDateString()))
    db_utils.execQuery(`INSERT INTO dbo.second_game_scores (user_id, other_id, score, max_score, goodImages, allImages, timestamp) VALUES ('${user_id}', '${other}', '${score}', '${firstGameImages}', '${String(result)}', '${String(allImages)}', '${String(new Date().toLocaleDateString())}');`)
}

async function getOtherUserId(user_id){
    const allUsers = await db_utils.execQuery(`SELECT DISTINCT User_id from dbo.users_ratings WHERE User_id != ${user_id}`);
    const users = allUsers.map(x => x.User_id)
    const random_userId = users[Math.floor(Math.random()*users.length)];
    return random_userId;
}

async function getOtherUserId(user_id){
    const allUsers = await db_utils.execQuery(`SELECT DISTINCT User_id from dbo.users_ratings WHERE User_id != ${user_id}`);
    const users = allUsers.map(x => x.User_id)
    const random_userId = users[Math.floor(Math.random()*users.length)];
    return random_userId;
}

async function getLeaders(){
    const allUsers = await db_utils.execQuery(`SELECT FullName, SUM([score]) AS TotalScore from dbo.users INNER JOIN dbo.first_game_scores ON dbo.users.Id = dbo.first_game_scores.user_id WHERE score > 3 GROUP BY FullName ORDER BY TotalScore DESC;`);
    return allUsers;
}

exports.setSecondGameResults = setSecondGameResults;
exports.getOtherUserId = getOtherUserId;
exports.setFirstGameResults = setFirstGameResults;
exports.insertRatings = insertRatings;
exports.getAllPictures = getAllPictures;
exports.getSecondGameImages = getSecondGameImages;
exports.getLeaders = getLeaders;
