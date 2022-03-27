const { async } = require("regenerator-runtime");
const db_utils = require("./db_utils");

async function checkEmailExistence(Email){
    const query = `SElECT count(*) as 'num' FROM dbo.users WHERE Email = '${Email}'`;
    const params = await db_utils.execQuery(query);
    return params[0].num;
}

async function checkUserPassword(Email){
    const query = `Select Password,Id,IsAdmin,last_time FROM dbo.users WHERE Email = '${Email}'`;
    const params = await db_utils.execQuery(query);
    if(params[0])
        return [params[0].Password, params[0].Id, params[0].IsAdmin, params[0].last_time];
    else
        return undefined;
    }

async function insertNewUser(Email, Password, Fullname, Gender, Age){
    const query = `INSERT INTO dbo.users (Email, Password, FullName, Gender, Age, IsAdmin, last_time) VALUES ('${Email}', '${Password}','${Fullname}', '${Gender}','${Age}', 0, '${String(new Date().toLocaleDateString())}')`;
    const beforeInsert = await db_utils.execQuery(`SElECT count(*) as 'num' FROM dbo.users`);
    await db_utils.execQuery(query);
    const afterInsert = await db_utils.execQuery(`SElECT count(*) as 'num' FROM dbo.users`);
    if(afterInsert[0].num-beforeInsert[0].num > 0)
        return {message: "User was added successfully"};
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
    const query = `SElECT FullName FROM dbo.users WHERE Email = '${email}'`;
    const params = await db_utils.execQuery(query);
    if(params[0])
        return params[0].FullName;
    else
        return undefined;
}

async function update_last_time(users_id){
    const query = `UPDATE dbo.Users set last_time = '${String(new Date().toLocaleDateString())}' WHERE Id = '${users_id}'`;
    await db_utils.execQuery(query);
}

exports.update_last_time = update_last_time
exports.checkEmailExistence = checkEmailExistence;
exports.checkUserPassword = checkUserPassword;
exports.insertNewUser = insertNewUser;
exports.getId = getId;
exports.getFullname = getFullname;