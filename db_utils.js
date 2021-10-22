const sql = require("mssql");

const config = {
    user: 'daniel',
    password: 'daniel',
    server: 'localhost',
    database: 'pictures',
    port: 1433,
    options: {
        trustServerCertificate: true,
        encrypt: false,
    },
    // pool: {
    //     max: 100,
    //     min: 0,
    //     idleTimeoutMillis: 30000
    // }
};
sql.connect(config, function (err){
    if(err){
        console.log(err)
    }
})

exports.execQuery = async function (query) {
    try {
        var result = await sql.query(query);
        return result.recordset;
    } catch (err) {
        console.error("SQL error", err);
        throw err;
    }
};