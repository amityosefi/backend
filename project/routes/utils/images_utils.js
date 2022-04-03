const db_utils = require("./db_utils");
const admin_utils = require("../utils/admin_utils");


const topic_names = ['Beach', 'Cities', 'Flowers', 'Forest', 'Mountain', 'Nature', 'Noam_s images', 'Universe'];
var fs = require('fs');
const { async } = require("regenerator-runtime");

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
    console.log("///////////////////");
    console.log(mergedArrays);
    console.log("///////////////////");
    let returnArr = [];
    let tmp = [];
    for (var i = 0; i < mergedArrays.length; i += 2) {
        dict = { id: mergedArrays[i], src: fs.readFileSync(mergedArrays[i+1], 'base64') }
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
async function fetchImages(pics,bins)
{
    let pl = pics.length;
    let bl = bins.length;
    let unrated = []
    let rated = []
    if(pl > 0)
    {
        let str = "select Id, Url from dbo.Images where ";
        for(var img = 0 ; img <pics.length; img++)
        {
            str+=("Id = "+String(pics[img])+" ");
            if(img < pics.length -1 )
                str+="or ";
        }
        unrated = await db_utils.execQuery(str);
    }
    if(bl >0)
    {
        let str_bins = "select Id, Url from dbo.Images where ";
        for(var img = 0 ; img <bins.length; img++)
        {
            str_bins+=("Id = "+bins[img].picId+" ");
            if(img < bins.length -1 )
                str_bins+="or ";
        }
        rated = await db_utils.execQuery(str_bins);
    }
    
    
    
    
    
    unrated_arr = []
    for(var i in unrated)
    {
        let img = unrated[i];
        let pic_id = img.Id;
        let url = fs.readFileSync(img.Url , 'base64');
        unrated_arr.push({id:pic_id,src:url})
    }
    rated_arr = []
    for(var i in rated)
    {
        let img = rated[i];
        let pic_id = img.Id;
        let url = fs.readFileSync(img.Url , 'base64');
        let _rating = bins[i].rating
        rated_arr.push({id:pic_id,src:url,rating:_rating})
    }
    let arr = []
    
    arr.push(unrated_arr)
    arr.push(rated_arr)
    
    return arr;
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
    console.log("user_id",user_id);
    console.log("score",score);
    console.log("result",result);
    console.log("allImages",allImages);
    console.log("firstGameImages",firstGameImages);
    console.log("date",new Date().toLocaleDateString());
    const d = new Date();
    const dt = `${d.getFullYear()}-${d.getUTCMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;

    db_utils.execQuery(`INSERT INTO dbo.first_game_scores (user_id, score, max_score, goodImages, allImages, timestamp) VALUES ('${user_id}', '${score}','${firstGameImages}', '${String(result)}', '${String(allImages)}', '${dt}');`)
}

async function setSecondGameResults(user_id, other, score, result, allImages){
    const firstGameImages = admin_utils.getGlobalSettings().firstGameImages;
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

async function getUserScore(user_id){
    const user_score = await db_utils.execQuery(`select SUM(score) as score from dbo.first_game_scores where user_id=${user_id} GROUP BY user_id`)
    if(user_score[0])
        return user_score[0].score;
    return 0;
}

async function getLastTime(user_id){
    let user_last_time = await db_utils.execQuery(`select distinct timestamp from dbo.first_game_scores where user_id=${user_id}`)
    console.log(user_last_time)
    if(user_last_time[0]){
        user_last_time = user_last_time[user_last_time.length-1].timestamp;
        user_last_time = user_last_time.getDate()+'-'+String(Number(user_last_time.getMonth())+1)+'-'+user_last_time.getFullYear();        
        return user_last_time;
    }
    return undefined;
}

exports.getLastTime = getLastTime;
exports.getUserScore = getUserScore;
exports.setSecondGameResults = setSecondGameResults;
exports.getOtherUserId = getOtherUserId;
exports.setFirstGameResults = setFirstGameResults;
exports.insertRatings = insertRatings;
exports.getAllPictures = getAllPictures;
exports.getSecondGameImages = getSecondGameImages;
exports.getLeaders = getLeaders;
exports.fetchImnages = fetchImages;
