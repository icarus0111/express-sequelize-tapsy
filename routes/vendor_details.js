const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const helper = require('../config/helperMethods');
const vendor_details_method = require('../config/vendorDetailsMethod');






//-------------------------------------------------------------
//  creating new vendor deatils row
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('connection create body data :.............', requestData);

    let newRowData = await vendor_details_method.createNewRow(requestData);

    if (newRowData.status) {
        helper.successResponce(res, 'Vendor details row created successfully.', newRowData.newData);
    } else {
        helper.errorResponce(res, `Something went wrong.`);
    }
});





//-------------------------------------------------------------
//  update vendor deatils row
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    // console.log('job create body data :.............', requestData);
    let newRowData = await vendor_details_method.updateRow(requestData);

    if (newRowData.status) {
        helper.successResponce(res, 'Vendor details updated successfully.');
    } else {
        helper.errorResponce(res, newRowData.err);
    }
});






module.exports = router;