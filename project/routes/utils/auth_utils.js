const { async } = require("regenerator-runtime");
const db_utils = require("./db_utils");
const admin_utils = require("../utils/admin_utils");


async function checkEmailExistence(Email){
    const query = `SElECT count(*) as 'num' FROM dbo.users WHERE Email = '${Email}'`;
    const params = await db_utils.execQuery(query);
    return params[0].num;
}

async function checkUserPassword(Email){
    const query = `Select Password,Id,IsAdmin,FullName FROM dbo.users WHERE Email = '${Email}'`;
    const params = await db_utils.execQuery(query);
    if(params[0])
        return [params[0].Password, params[0].Id, params[0].IsAdmin, params[0].FullName];
    else
        return undefined;
    }

async function insertNewUser(Email, Password, Fullname, Gender, Age){
    let a = 'a'
    const query = `INSERT INTO dbo.users (Email,FirstName,LastName, Password, FullName, Gender, Age, IsAdmin) VALUES ('${Email}','${a}','${a}', '${Password}','${Fullname}', '${Gender}','${Age}', 0)`;
    const beforeInsert = await db_utils.execQuery(`SElECT count(*) as 'num' FROM dbo.users`);
    await db_utils.execQuery(query);
    const afterInsert = await db_utils.execQuery(`SElECT count(*) as 'num' FROM dbo.users`);
    if(afterInsert[0].num-beforeInsert[0].num > 0){
        let params = await db_utils.execQuery(`select Id,IsAdmin,FullName,Email from dbo.Users where Email='${Email}'`);
        const globalSettings = await admin_utils.getGlobalSettings();
        params = params[0];
        return {message: "User was added successfully", Id: params.Id, IsAdmin: params.IsAdmin, FullName: params.FullName, globalSettings: globalSettings};
    }
    else
        return {message: "There was a problem adding this user"};
}

async function getId(email){
    const query = `SElECT Id FROM dbo.users WHERE Email = '${email}'`;
    const params = await db_utils.execQuery(query);
    if(params[0])
        return params[0].Id;
    else
        return undefined;
}

async function getFullname(email){
    console.log(email);

    const query = `SElECT FullName FROM dbo.users WHERE Email = '${email}'`;
    const params = await db_utils.execQuery(query);
    if(params[0])
        return params[0].FullName;
    else
        return undefined;
}


exports.checkEmailExistence = checkEmailExistence;
exports.checkUserPassword = checkUserPassword;
exports.insertNewUser = insertNewUser;
exports.getId = getId;
exports.getFullname = getFullname;