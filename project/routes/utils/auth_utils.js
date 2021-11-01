const db_utils = require("./db_utils");

async function getUserDetails(username, password){
    const query = `SElECT * FROM dbo.users WHERE username = '${username}' and password = '${password}'`;
    console.log(query);
    const params = await db_utils.execQuery(query);
    return params;
}

exports.getUserDetails = getUserDetails;