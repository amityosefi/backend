const express = require("express");
const router = express.Router();
const auth_utils = require("./utils/auth_utils");
const db_utils = require("./utils/db_utils");
const bcrypt = require("bcrypt");


// router.use(async function (req, res, next) {
//   if (req.session && req.session.user_id) {
//     DButils.execQuery("SELECT user_id FROM users")
//       .then((users) => {
//         if (users.find((x) => x.user_id === req.session.user_id)) {
//           req.user_id = req.session.user_id;
//           next();
//         }
//       })
//       .catch((err) => next(err));
//   } else {
//     res.sendStatus(401);
//   }
// });


router.post("/register", async (req, res, next) => {
  try {

    // const users = await db_utils.execQuery(
    //   "SELECT Email FROM dbo.users"
    // );

    // if (users.find((x) => x.Email === req.body.Email))
    //   throw { status: 409, message: "Email taken" };


    if(!req.body.Email || !req.body.Password || !req.body.FirstName || !req.body.LastName || !req.body.Gender || !req.body.Age){
      res.status(400).send({message: "Wrong inputs"});
    }
    
    const checkUser = await auth_utils.checkUserPassword(req.body.Email);
    if(checkUser > 0)
      res.status(200).send({message: "There is already Email and password"});
    else{
      // hash the password
    let hash_password = bcrypt.hashSync(req.body.Password, parseInt(process.env.bcrypt_saltRounds));
      req.body.Password = hash_password;
      const ans = await auth_utils.insertNewUser(req.body.Email, req.body.Password, req.body.FirstName, req.body.LastName, req.body.Gender, req.body.Age);
      res.status(201).send(ans);
    }
  } catch (error) {
    next(error);
 }
}); 

router.post('/login', async function(req, res) {

  try {
    const Email = req.body.Email;
    let Password = req.body.Password;
    if (!Email || !Password) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await auth_utils.checkUserDetails(Email);
    if(ans && bcrypt.compareSync(req.body.Password, ans)){
      req.session.user_id = user.user_id;
      res.status(200).send({message: "Login Successfully"});
    }
    else
      res.status(200).send({message: "There is no Email or password"});
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
