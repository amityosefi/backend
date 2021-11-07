const sql = require("mssql");
const sql2 = require('mssql/msnodesqlv8');
const config = {
    
    server: '(LocalDb)\\Images',
    database: 'Pictures',
    driver:'msnodesqlv8',
    options: {
        trustServerCertificate: true,
        encrypt: false,
    },

};
sql.connect(config, function (err){
    if(err){
        console.log(err)
    }
})

exports.execQuery = async function (query) {
    try {
        const result = await sql.query(query);
        return result.recordset;
    } catch (err) {
        console.error("SQL error", err);
        throw err;
    }
};