const express = require("express");
const router = express.Router();
const auth_utils = require("./utils/auth_utils");
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

    console.log(req.body.Email);
    console.log(req.body.Password);
    console.log(req.body.FirstName);
    console.log(req.body.LastName);
    console.log(req.body.Gender);
    console.log(req.body.Age);
    if(!req.body.Email || !req.body.Password || !req.body.FirstName || !req.body.LastName || !req.body.Gender || !req.body.Age){
      res.status(400).send({message: "Wrong inputs"});
    }
    
    const checkUser = await auth_utils.checkEmailExistence(req.body.Email);
    if(checkUser > 0)
      res.status(200).send({message: "There is already Email"});
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
    const ans = await auth_utils.checkUserPassword(Email);
    if(ans && bcrypt.compareSync(req.body.Password, ans)){
      req.session.user_id = Email;
      
      res.status(200).send({message: "Login Successfully"});
    }
    else
      res.status(200).send({message: "There is no Email or password"});
  } catch (err) {
    console.log(err);
    res.status(500).send({message: new Error(err)});
  }
});


router.post("/logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;
