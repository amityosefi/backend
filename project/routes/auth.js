const express = require("express");
const router = express.Router();
const auth_utils = require("./utils/auth_utils");
const db_utils = require("./utils/db_utils");
// const bcrypt = require("bcryptjs");
let CURRENT_USERNAME = "";


router.post("/register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    console.log("Reg");
    // const users = await db_utils.execQuery(
    //   "SELECT Email FROM dbo.users"
    // );

    // if (users.find((x) => x.Email === req.body.Email))
    //   throw { status: 409, message: "Email taken" };

    //hash the password
    // let hash_password = bcrypt.hashSync(
    //   req.body.Password,
    //   parseInt(process.env.bcrypt_saltRounds)
    // );
    // req.body.Password = hash_password;

    console.log(req.body.Gender);
    console.log(req.body.Age);

    // add the new username
    await db_utils.execQuery(
      `INSERT INTO dbo.users (Email, Password, FirstName, LastName, Gender, Age) VALUES ('${req.body.Email}', '${req.body.Password}','${req.body.FirstName}', '${req.body.LastName}','${req.body.Gender}','${req.body.Age}''`
    );

    //req.session.lastSearch = null;

    res.status(201).send("user created");
  } catch (error) {
    next(error);
 }
}); 

router.post('/login', async function(req, res) {

  try {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !(password)) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await auth_utils.getUserDetails(username, password);
    res.status(200).send(ans);

  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

// router.post("/Login", async (req, res, next) => {
  
//   try {
//     const user = (
//       await DButils.execQuery(
//         `SELECT * FROM dbo.users WHERE username = '${req.body.username}'`
//       )
//     )[0];

//     // check that username exists & the password is correct
//     if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
//       throw { status: 401, message: "Username or Password incorrect" };
//     }

//     // Set cookie
//     req.session.user_id = user.user_id;
//     req.session.lastSearch = null;

//     CURRENT_USERNAME = req.body.username;
    
//     // return cookie
//     res.status(200).send({ success: true, message: "login succeeded" });
//   } catch (error) {
//     next(error);
//   }
// });

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;
