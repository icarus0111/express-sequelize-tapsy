const express = require('express');
const router = express.Router();
const UserModel = require('../db/models').user;
const helper = require('../config/helperMethods');



//-------------------------------------------------------------
//  creating categories
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {
    // req.body.password = await helper.encryptPassword(req.body.password);
    // UserModel.create(req.body).then(user => {
    //     helper.successResponce(res, 'User created successfully.');
    // }).catch(err => {
    //     console.log('register error : ...................', err);
    //     if (err.errors[0].type == 'unique violation') {
    //         helper.errorResponce(res, `You are already registered. Please login to continue.`);
    //     } else {
    //         helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    //     }
    // });
});



module.exports = router;