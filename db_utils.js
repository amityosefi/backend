require("dotenv").config();

const sql = require('mssql/msnodesqlv8');
const config = {
  server: process.env.tedious_server,
  database: process.env.tedious_database,
  driver:'msnodesqlv8',
  options: {
    enableArithAbort: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
async function getTopImgs(number)
{
    try
    {
        const imgs = await execQuery(`SELECT * from
        [Images].[dbo].[Images]`);
        const img_list = randomize(imgs,number);
        return img_list;

    }
    catch(Error)
    {
        console.error(Error);
    }
}
function randomize(imgs,number)
{
  selected = [];
  toReturn = [];
  for(var i = 0 ; i < number ; i++)
  {
    let index = select_random(selected,imgs.length);
    selected.push(index);
    toReturn.push(imgs[index]);
  }
  return toReturn;
}
function select_random(selected,size)
{
  let i = Math.floor(Math.random()*size);
  while(selected.includes(i))
  {
    i = Math.floor(Math.random()*size);
  }
  return i;
}
async function SubmitTimeDiff(diff,PicURL)
{
  try
    {
        await execQuery(`insert into [Images].[dbo].[time_stamps](PicURl,QueryTime)
        VALUES('${PicURL}','${diff}');`);

    }
    catch(Error)
    {
        console.error(Error);
    }

}
    
async function execQuery (query) {
  await poolConnect;
  try {
    var result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

exports.getTopImgs = getTopImgs;
exports.execQuery = execQuery;
exports.SubmitTimeDiff = SubmitTimeDiff;