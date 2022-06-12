const { async } = require("regenerator-runtime");
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
// async function getUsers(){
//     const params = await db_utils.execQuery(`SElECT * FROM dbo.users`);
//     return params;
// }
async function getUsers(){ // getFirstGame
    const params = await db_utils.execQuery(`SElECT score FROM dbo.first_game_scores where score <= 8`);
    return params;
}

async function getRanks(){ // getFirstGame
    const params = await db_utils.execQuery(`SElECT * FROM dbo.users_ratings`);
    const pic_ids = await db_utils.execQuery(`SElECT Id FROM dbo.Images`);
    let arr = [];
    pic_ids.map((x)=>arr.push(x.Id));
    let dict = {};
    for(var i = 0; i < arr.length; i++ )
    {
        let id = arr[i];
        dict[id] = [0,0,0,0,0,0,0,0,0,0];
    }
    params.map((x)=>{
        let id = x.Pic_id;
        let rating = x.rating;
        dict[id][rating-1]+=1;
    });
    console.log("///////////////////");
    // console.log(dict);
    return dict;
}

async function getRanksUsers()
{
    const params = await db_utils.execQuery(`select Email,Pic_id,rating from dbo.users_ratings as a inner join dbo.Users as b on a.User_id = b.Id`);
    const pic_ids = await db_utils.execQuery(`SElECT Id FROM dbo.Images`);
    const emails = await db_utils.execQuery(`Select Email FROM dbo.Users`);
    let num_pics = pic_ids.length;
    dict = {}
    emails.map((x)=>{
        let email = x.Email;
        dict[email] = new Array(num_pics);
    })
    params.map((x)=>
    {
        let email = x.Email;
        let ind = x.Pic_id;
        let rating = x.rating;
        dict[email][ind-1] = rating;
    });
    console.log(dict);
    return [dict,num_pics];
    

}
// exports.getFirstGame = getFirstGame;
exports.getUsers = getUsers;
exports.review = review;
exports.getGlobalSettings = getGlobalSettings;
exports.changeSettings = changeSettings;
exports.getRanks = getRanks;
exports.getRanksUsers = getRanksUsers;
