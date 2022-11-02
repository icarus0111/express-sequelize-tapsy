const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const CategoryModel = require('../db/models').category;
const ServiceModel = require('../db/models').service;
const JobsModel = require('../db/models').jobs;
const ConnModel = require('../db/models').connection;
const CountModel = require('../db/models').subcatandservicecount;
const helper = require('../config/helperMethods');
const connMethods = require('../config/connectionMethods');
const Op = Sequelize.Op;
let middleware = require('../config/jwtMiddleware');



//-------------------------------------------------------------
//  creating new connection data
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('connection create body data :.............', requestData);

    let newRowData = await connMethods.createNewConnRow(requestData);
    if (newRowData.status) {
        helper.successResponce(res, 'Connection row created successfully.', newRowData.newData);
    } else {
        helper.errorResponce(res, `Something went wrong.`);
    }
});





//-------------------------------------------------------------
//  jobs list for vendor
//-------------------------------------------------------------
router.post('/vendor/list', async(req, res, next) => {
    console.log('job create body data :.............', req.body);
    // JobsModel.create(req.body).then(job => {
    //     helper.successResponce(res, 'Job created successfully.');
    // }).catch(err => {
    //     if(err && err.errors.length > 0){
    //         helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    //     }else{
    //         helper.errorResponce(res, `Sorry, something went wrong. Please try again.`);
    //     }        
    // })
});





//-------------------------------------------------------------
//  jobs list for customers
//-------------------------------------------------------------
router.post('/customer/list', async(req, res, next) => {
    console.log('job create body data :.............', req.body);
    // JobsModel.create(req.body).then(job => {
    //     helper.successResponce(res, 'Job created successfully.');
    // }).catch(err => {
    //     if(err && err.errors.length > 0){
    //         helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    //     }else{
    //         helper.errorResponce(res, `Sorry, something went wrong. Please try again.`);
    //     }        
    // })
});





//-------------------------------------------------------------
//  update job
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    // console.log('job create body data :.............', requestData);
    let newRowData = await connMethods.updateConnRow(requestData);
    if (newRowData.status) {
        helper.successResponce(res, 'Connection row created successfully.');
    } else {
        helper.errorResponce(res, newRowData.err);
    }
});






module.exports = router;