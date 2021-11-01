const db_utils = require("./db_utils");

async function checkEmailExistence(Email){
    const query = `SElECT count(*) as 'num' FROM dbo.users WHERE Email = '${Email}'`;
    const params = await db_utils.execQuery(query);
    return params[0].num;
}

async function checkUserPassword(Email){
    const query = `SElECT Password FROM dbo.users WHERE Email = '${Email}'`;
    const params = await db_utils.execQuery(query);
    if(params[0])
        return params[0].Password;
    else
        return undefined;
    }
async function insertNewUser(Email, Password, FirstName, LastName, Gender, Age){
    const query = `INSERT INTO dbo.users (Email, Password, FirstName, LastName, Gender, Age) VALUES ('${Email}', '${Password}','${FirstName}', '${LastName}','${Gender}','${Age}')`;
    const beforeInsert = await db_utils.execQuery(`SElECT count(*) as 'num' FROM dbo.users`);
    const params = await db_utils.execQuery(query);
    const afterInsert = await db_utils.execQuery(`SElECT count(*) as 'num' FROM dbo.users`);
    if(afterInsert[0].num-beforeInsert[0].num > 0)
        return {message: "User was added successfully"};
    else
        return {message: "There was a problem adding this user"};
}

exports.checkEmailExistence = checkEmailExistence;
exports.checkUserPassword = checkUserPassword;
exports.insertNewUser = insertNewUser;