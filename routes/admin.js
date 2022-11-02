const express = require('express');
const router = express.Router();
const UserModel = require('../db/models').user;
const helper = require('../config/helperMethods');




//-------------------------------------------------------------
//  admin login with username and password
//-------------------------------------------------------------
router.post('/login', async(req, res, next) => {
    console.log('body data :...............', req.body);
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('body data :...............', requestData);
    UserModel.findAll({
        attributes: ['id', 'username', 'password', 'role_id', 'name'],
        where: {
            username: requestData.username,
            role_id: 1,
            active: 1
        }
    }).then(async(admin) => {
        console.log('Found admin : ...................', admin);
        console.log('Found admin : ...................', admin.length);
        if (admin && admin.length > 0) {

            let isPassValid = await helper.comparePassword(requestData.password, admin[0].password);
            if (isPassValid) {
                const { id, username, role_id, name } = admin[0];
                let data = { id, username, role_id, name };
                // data = helper.encryptResponceData(data);
                // let token = req.csrfToken();
                let token = await helper.generateJwtToken(data);
                helper.successResponce(res, 'Login successfully.', data, token);
            } else {
                helper.errorResponce(res, `Invalid credential.`);
            }
        } else {
            helper.errorResponce(res, `Invalid credential.`);
        }
    }).catch((err) => {
        console.log('Found admin error: ...................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});




module.exports = router;