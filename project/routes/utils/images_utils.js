const db_utils = require("./db_utils");

const topic_names = ['Animals', 'Beaches', 'Big Cities', 'Light Houses', 'Mountains', 'Other', 'Sunsets', 'Universe'];
var fs = require('fs');

async function getRandomcategories(categories) {
    let arr = [];
    while(categories > 0){
        let rand = Math.floor(Math.random() * 8); // 8 is the number of topics right now
        if(arr.includes(topic_names[rand]))
            continue;
        arr.push(topic_names[rand]);
        categories--;
    }
    return arr;
}



async function getRandomPictures(sql_query, numbers) { 
    const max = sql_query.length; // max images in this category
    let arr = [];
    while(numbers > 0){
        let r = Math.floor(Math.random() * max);
        if(!arr.includes(sql_query[r])){
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

async function getAllPictures(categories, numbers){
    
    let all_url_pictures = [];
    let full_details;
    const selected_categories = await getRandomcategories(categories);
    for(let i=0; i< selected_categories.length; i++){
        const sql_query = await db_utils.execQuery(`select Id, Url from dbo.images where Category = '${selected_categories[i]}'`);
        const url_pictures = await getRandomPictures(sql_query, numbers);
        
        all_url_pictures.push(url_pictures);
        
    }
    const mergedArrays = [].concat.apply([], all_url_pictures);
    let returnArr = [];
    let tmp = { id: 0 , url: ""};
    mergedArrays.map((path)=>
    {
        // let base64 = path;
        if(isNaN(path)){ 
            console.log(path);
        // let base64 =  fs.readFileSync(path,'base64');
            let base64 = fs.readFileSync(path,'base64');
            tmp.url = base64;
            returnArr.push(tmp);
        }
        else{
            let tmp = { id: 0 , url: ""};
            tmp.id = path;
        }
        
    });
    return {urls: returnArr};
}

async function insertRatings(user_id, pict_ratings){
    if (pict_ratings.length >= 4) { // 72
        for(let i=0; i< pict_ratings.length; i++){
            const sql_query = await db_utils.execQuery(`INSERT INTO dbo.users_ratings (User_id, Pic_id, rating)
            VALUES ('${user_id}', '${pict_ratings[0]}', '${pict_ratings[1]}');`);
    }
    return "Insert success";
    }
    return "Insert fail";
}


// exports.getRandomPictures = getRandomPictures;
// exports.getRandomcategories = getRandomcategories;
exports.insertRatings = insertRatings;
exports.getAllPictures = getAllPictures;
