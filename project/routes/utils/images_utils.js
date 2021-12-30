const db_utils = require("./db_utils");

const topic_names = ['Animals', 'Beaches', 'Big Cities', 'Light Houses', 'Mountains', 'Other', 'Sunsets', 'Universe'];
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
            const sql_query = await db_utils.execQuery(`INSERT INTO dbo.users_ratings (User_id, Pic_id, rating)
            VALUES ('${user_id}', '${pict_ratings[0]}', '${pict_ratings[1]}');`);
        }
        return "Insert success";
    }
    return "Insert fail";
}

async function getSecondGameImages(user_id) {
    let best_ratings = [];
    let worst_ratings = [];
    let counter = 10;
    while (best_ratings.length < 2) { // 25% of 72 pictures = 18
        let x = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        best_ratings = best_ratings.concat.apply(best_ratings, x);
        counter -= 1;
    }
    counter = 0;
    while (worst_ratings.length < 6) { // 50% of 72 pictures = 36
        let y = await db_utils.execQuery(`select Pic_id from dbo.users_ratings where User_id = '${user_id}' and rating = ${counter}`);
        worst_ratings = worst_ratings.concat.apply(worst_ratings, y);
        counter += 1;
    }
    // console.log(best_ratings.length); // needs to be more than 18
    // console.log(worst_ratings.length); // needs to be more than 36

    best_ratings = await getRandomImages(best_ratings, 2);
    worst_ratings = await getRandomImages(worst_ratings, 6);

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


// exports.getRandomPictures = getRandomPictures;
// exports.getRandomcategories = getRandomcategories;
exports.insertRatings = insertRatings;
exports.getAllPictures = getAllPictures;
exports.getSecondGameImages = getSecondGameImages;
