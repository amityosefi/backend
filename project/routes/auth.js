const express = require("express");
const router = express.Router();
const auth_utils = require("./utils/auth_utils");
const bcrypt = require("bcrypt");
const admin_utils = require("./utils/admin_utils");
const images_utils = require("./utils/images_utils");


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


    if(!req.body.Email || !req.body.Fullname || !req.body.Gender || !req.body.Age){
      res.status(400).send({message: "Wrong inputs"});
    }
    
    const checkUser = await auth_utils.checkEmailExistence(req.body.Email);
    if(checkUser > 0)
      res.status(200).send({message: "Email is already exists"});
    else{
      // hash the password
      // let hash_password = bcrypt.hashSync(req.body.Password, parseInt(process.env.bcrypt_saltRounds));
      // req.body.Password = hash_password;
      const ans = await auth_utils.insertNewUser(req.body.Email, req.body.Fullname, req.body.Gender, req.body.Age);
      res.status(201).send(ans);
    }
  } catch (error) {
    next(error);
 }
}); 

router.post('/login', async function(req, res) {
  try {
    const Email = req.body.Email;
    // let Password = req.body.Password;
    if (!Email) {
      res.status(400).send({ message: 'Wrong inputs' });
    }
    const ans = await auth_utils.checkUserPassword(Email);
    console.log(ans);
    if(ans && ans[0] ){
      req.session.user_id = ans[1];
      const globalSettings = await admin_utils.getGlobalSettings();
      const user_score = await images_utils.getUserScore(req.session.user_id);
      const user_last_time = await images_utils.getLastTime(ans[1]);
      const finish_rate = await images_utils.getRate(ans[1]);
      res.status(200).send({Id:req.session.user_id, IsAdmin: ans[2], FullName: ans[3], globalSettings: globalSettings, user_score:user_score, last_time: user_last_time, numRanked: finish_rate, is_submitted:ans[4],is_done:ans[5],ranked:ans[6],unranked:ans[7],extras:ans[8]});
    }
    else
      res.status(401).send({message: "There is no Email"});
  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});

router.get("/getFullname/:Email", async (req, res, next) => {
  try {
    console.log("Asd")
    const Email = req.params.Email;
    console.log(Email);
    const fullname = await auth_utils.getFullname(Email);
    res.status(201).send(fullname);
    
  } catch (error) {
    next(error);
 }
}); 

router.post("/logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;
