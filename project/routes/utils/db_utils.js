const sql = require("mssql");

const config = {
    user: 'daniel',
    password: '001122',
    server: 'DESKTOP-VN5OOAQ',
    database: 'Pictures',
    port: 1433,
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
