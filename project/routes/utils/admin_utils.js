const db_utils = require("./db_utils");

let globalSettings = {
    'rankImages' : 72,
    'firstGameImages' : 8,
    'firstGameImagesSelected' : 2
};

function getGlobalSettings(){
    return globalSettings;
}

async function changeSettings(rankImages, firstGameImages, firstGameImagesSelected){
    globalSettings.rankImages = rankImages;
    globalSettings.firstGameImages = firstGameImages;
    globalSettings.firstGameImagesSelected = firstGameImagesSelected;
    return globalSettings;
}
async function review(text){
    const query = `INSERT INTO dbo.Reviews (review) VALUES ('${text}')`;
    await db_utils.execQuery(query);
    return {ans: "The text insert to db"};
}
async function getUsers(){
    const params = await db_utils.execQuery(`SElECT * FROM dbo.users`);
    return params;
}

exports.getUsers = getUsers;
exports.review = review;
exports.getGlobalSettings = getGlobalSettings;
exports.changeSettings = changeSettings;
