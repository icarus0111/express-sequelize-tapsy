const express = require('express');
const router = express.Router();
const UserModel = require('../db/models').user;
const CategoryModel = require('../db/models').category;
const StateModel = require('../db/models').states;
const helper = require('../config/helperMethods');
const Sequelize = require('sequelize');



//-------------------------------------------------------------
//  getting all customers list
//-------------------------------------------------------------
router.post('/list', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('###############################       ', requestData);
    const { limit, page } = requestData;

    UserModel.findAndCountAll({
        attributes: {
            exclude: ['role_id', 'username', 'password', 'otp', 'active']
        },
        where: {
            active: 1,
            role_id: 2
        },
        include: [{
            model: StateModel,
            attributes: ['id', 'short_name'],
            as: 'state_details',
            where: {
                // id: Sequelize.col('user.id'),
                active: 1
            },
            required: false
        }],
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(customerList => {
        console.log('all customerList list :................', customerList);
        helper.successResponce(res, 'Customers fetched successfully.', customerList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});




//-------------------------------------------------------------
//  getting particular customer details
//-------------------------------------------------------------
router.post('/get-details', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { id } = requestData;

    UserModel.findAll({
        attributes: {
            exclude: ['password', 'otp', 'active']
        },
        where: {
            id: id,
            role_id: 2,
            active: 1
        },
        include: [{
            model: StateModel,
            attributes: ['id', 'short_name'],
            as: 'state_details',
            where: {
                // id: Sequelize.col('user.id'),
                active: 1
            },
            required: false
        }],
        limit: 1
    }).then(customerList => {
        helper.successResponce(res, 'Customers fetched successfully.', customerList);
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Customers details fetch error.`);
        }
    });
});





//-------------------------------------------------------------
//  getting particular admin details
//-------------------------------------------------------------
router.post('/get-details-admin', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { id } = requestData;

    UserModel.findAll({
        attributes: {
            exclude: ['password', 'otp', 'active']
        },
        where: {
            id: id,
            role_id: 1,
            active: 1
        },
        include: [{
            model: StateModel,
            attributes: ['id', 'short_name'],
            as: 'state_details',
            where: {
                // id: Sequelize.col('user.id'),
                active: 1
            },
            required: false
        }],
        limit: 1
    }).then(customerList => {
        helper.successResponce(res, 'Admin details fetched successfully.', customerList);
    }).catch(err => {
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Admin details fetch error.`);
        }
    });
});





//-------------------------------------------------------------
//  getting particular vendor details
//-------------------------------------------------------------
router.post('/get-vendor-details', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { id } = requestData;

    UserModel.findAll({
        attributes: {
            exclude: ['password', 'otp', 'active']
        },
        where: {
            id: id,
            role_id: 3,
            active: 1
        },
        limit: 1,
        include: [{
                model: CategoryModel,
                as: 'category_details',
                attributes: ['id', 'name'],
                // where: {
                //     category_id: Sequelize.col('id')
                // }
            },
            {
                model: StateModel,
                attributes: ['id', 'short_name'],
                as: 'state_details',
                where: {
                    // id: Sequelize.col('user.id'),
                    active: 1
                },
                required: false
            }
        ]
    }).then(customerList => {
        helper.successResponce(res, 'Customers fetched successfully.', customerList);
    }).catch(err => {
        console.log('###### error log ######', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});

module.exports = router;