const express = require('express');
const router = express.Router();
const StateModel = require('../db/models').states;
const helper = require('../config/helperMethods');




//-------------------------------------------------------------
//  get All state list
//-------------------------------------------------------------
router.get('/list', async(req, res, next) => {
    StateModel.findAll({
        where: {
            active: 1
        }
    }).then(stateList => {
        // console.log('all category list :................', categoryList);
        helper.successResponce(res, 'State fetched successfully.', stateList);
    }).catch(err => {
        console.log('category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, could not fetch state list.`);
    });
});





module.exports = router;