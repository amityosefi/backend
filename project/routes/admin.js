const express = require("express");
const router = express.Router();
const admin_utils = require("./utils/admin_utils");


router.post('/review', async function (req, res) {
    try {
        const text = req.body.text;

        const ans = await admin_utils.review(text);
        res.status(200).send(ans);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: new Error(err) });
    }
});


router.use(async function (req, res, next) {
    
    const isAdmin = req.body.isAdmin;

    if (!isAdmin){
        res.status(401).send({message: "The user not authorized"});
    } 
    next();
});

router.post('/changeSettings', async function (req, res) {
    try {
        
        const rankImages = req.body.rankImages;
        const firstGameImages = req.body.firstGameImages;
        const firstGameImagesSelected = req.body.firstGameImagesSelected;
        
        
        if (!rankImages || !firstGameImages || !firstGameImagesSelected) {
            res.status(200).send({message: "There was a server error"});
        }
        else if (rankImages>=60 && rankImages<=120 && firstGameImages>=4 && firstGameImages<=16 && firstGameImagesSelected>=1 && firstGameImagesSelected<=4 && firstGameImages>firstGameImagesSelected){
            const ans = await admin_utils.changeSettings(rankImages, firstGameImages, firstGameImagesSelected);
            res.status(200).send(ans);
        }
        else{
            res.status(200).send({message: "There was an inputs error"});
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({ message: new Error(err) });
    }
});


router.post('/users', async function (req, res) {
    try {
        const ans = await admin_utils.getUsers();
        res.status(200).send(ans);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: new Error(err) });
    }
});

router.post('/firstGame', async function (req, res) {
    try {
        const ans = await admin_utils.getFirstGame();
        res.status(200).send(ans);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: new Error(err) });
    }
});


router.post('/firstGameData', async function (req, res) {
    try {
        const ans = await admin_utils.getFirstGameData();
        res.status(200).send(ans);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: new Error(err) });
    }
});

router.post('/SecondGameData', async function (req, res) {
    try {
        const ans = await admin_utils.getSecondGameData();
        res.status(200).send(ans);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: new Error(err) });
    }
});

module.exports = router;