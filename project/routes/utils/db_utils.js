const sql = require("mssql");

const config = {
    server: 'DESKTOP-VN5OOAQ',
    port: 1433,
    user: 'daniel',
    password: '001122',
    // driver:'msnodesqlv8',   
    database: 'Pictures',
    
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