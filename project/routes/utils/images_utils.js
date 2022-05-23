const db_utils = require("./db_utils");
const admin_utils = require("../utils/admin_utils");


const categories = ['Architecture and Structure', 'B_W', 'Beach and Sea', 'Cityscape', 'Fields', 'Flowers', 'Landscape', 'Universe'];
var fs = require('fs');


function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

async function getAllPictures(totalAmountEachCategory, lastCategory) {

    let i = 0;
    let all_url_pictures = [];
    let all_leftover_pictures = [];
    let query = '';
    let leftover = 126 -  admin_utils.getGlobalSettings().rankImages;
    let extra =  Math.floor(leftover/8);
    let fin_extra = leftover - extra*7;
    const getShuffleCategories = shuffle(categories);
    let a = 0, b = 0;
    for (let category in getShuffleCategories){
        if (i == 7){
            a = lastCategory;
            b = lastCategory+fin_extra
            query = `select TOP ${b} Id, Url from dbo.images where Category = '${getShuffleCategories[category]}' order by NEWID()`;
        } else{
            a = totalAmountEachCategory;
            b = totalAmountEachCategory+extra;
            query = `select TOP ${b} Id, Url from dbo.images where Category = '${getShuffleCategories[category]}' order by NEWID()`;
        }
        const sql_query = await db_utils.execQuery(query);
        let rate_imgs = sql_query.slice(0,a);
        let leftovers = sql_query.slice(a,b);
        i = i + 1;
        rate_imgs.forEach(function(elem) {
            dict = { id: elem.Id, src: fs.readFileSync(elem.Url, 'base64') }
            all_url_pictures.push(dict);
        });
        leftovers.forEach(function(elem) {
            dict = { id: elem.Id }
            all_leftover_pictures.push(dict);
        });
    }
    let merged = [].concat.apply([], all_url_pictures);
    const mergedArrays = shuffle(merged);
    let all_merged = [].concat.apply([], all_leftover_pictures);
    const mergedLeftovers = shuffle(all_merged);
    return { urls: mergedArrays, extras: mergedLeftovers };

}
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
async function getRate(user_id){
    const sql_query = await db_utils.execQuery(`select count(*) as a from dbo.users_ratings where User_id=${user_id}`);
    if (sql_query && sql_query[0].a >= 72){
        return sql_query[0].a;
    }
    return 0;
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

async function getSecondGameImages(user_id) { //2*4 - best ///////////// 32-2*4 - worst
    let best_ratings = [];
    let worst_ratings = [];
    let counter = 10;

    const globalSettings = admin_utils.getGlobalSettings();
    const firstGameImagesSelected  = globalSettings.firstGameImagesSelected; //2
    const firstGameImages  = globalSettings.firstGameImages - firstGameImagesSelected; // 6

    while (best_ratings.length < firstGameImagesSelected * 4) {
        let x = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        best_ratings = best_ratings.concat.apply(best_ratings, x);
        counter -= 1;
    }
    if(best_ratings.length > firstGameImagesSelected * 4)
    {
        best_ratings.slice(0,firstGameImagesSelected * 4);
    }

    counter = 0;
    while (worst_ratings.length < firstGameImages * 4) {
        let y = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        worst_ratings = worst_ratings.concat.apply(worst_ratings, y);
        counter += 1;
    }

    if(worst_ratings.length > firstGameImages * 4)
    {
        worst_ratings.slice(0,firstGameImages * 4);
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
    // console.log(pl,bl)
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
        
        // console.log(arr[i].Pic_id)
        res.push(pic);
    }
    return res;
}

async function setFirstGameResults(user_id, score, result, allImages){
    const firstGameImages = admin_utils.getGlobalSettings().firstGameImages;

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
    const allUsers = await db_utils.execQuery(`SELECT FullName, SUM([score]) AS TotalScore from dbo.users INNER JOIN dbo.first_game_scores ON dbo.users.Id = dbo.first_game_scores.user_id GROUP BY FullName ORDER BY TotalScore DESC;`);
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
    if(user_last_time[0]){
        user_last_time = user_last_time[user_last_time.length-1].timestamp;
        let last_time = new Date(user_last_time)
        let ans = last_time.getDate()+'-'+String(Number(last_time.getMonth())+1)+'-'+last_time.getFullYear();        
        return ans;
    }
    return undefined;
}

async function saveAllPics(ranked,unranked,extras,user_id)
{
    await db_utils.execQuery(`delete from dbo.Saved_Ranked where User_id = ${user_id}`);
    await db_utils.execQuery(`delete from dbo.Saved_Unranked where User_id = ${user_id}`);
    await db_utils.execQuery(`delete from dbo.Saved_Extras where User_id = ${user_id}`);
    if(ranked)
    {
        for(var img in ranked)
        {
            let x = ranked[img];
            await db_utils.execQuery(`insert into dbo.Saved_Ranked (User_id,Pic_id,Rating) VALUES (${user_id},${x.picId},${x.rating})`);
        }
    }
    if(unranked)
    {
        for(var img in unranked)
        {
            let x = unranked[img];
            await db_utils.execQuery(`insert into dbo.Saved_Unranked (User_id,Pic_id) VALUES (${user_id},${x})`);
        }
    }
    if(extras)
    {
        for(var img in extras)
        {
            let x = extras[img];
            await db_utils.execQuery(`insert into dbo.Saved_Extras (User_id,Pic_id) VALUES (${user_id},${x.id})`);
        }
    }
    
    
    
    // if(ranked)
    //     ranked.forEach((x) => {await db_utils.execQuery(`insert into dbo.Saved_Ranked (User_id,Pic_id,Rating) VALUES (${user_id},${x.id},${x.rating})`)});
    // if(unranked)
    //     unranked.forEach((x) => {await db_utils.execQuery(`insert into dbo.Saved_Unranked (User_id,Pic_id) VALUES (${user_id},${x.id})`)});
    // if(extras)
    //     unranked.forEach((x) => {await db_utils.execQuery(`insert into dbo.Saved_Extras (User_id,Pic_id) VALUES (${user_id},${x.id})`)});

}

exports.saveAllPics = saveAllPics;
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
exports.getRate = getRate;
