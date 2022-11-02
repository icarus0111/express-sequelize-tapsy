const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const helper = require('../config/helperMethods');
const vendor_details_method = require('../config/vendorDetailsMethod');
const PaymentDetailsMethods = require('../config/paymentDetailsMethod');
// const PaymentDetailsModel = require('../db/models').payment_detail;




//-------------------------------------------------------------
//  update payment deatils row
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    // console.log('job create body data :.............', requestData);
    let newRowData = await PaymentDetailsMethods.updateRow(requestData);

    if (newRowData.status) {
        helper.successResponce(res, 'Payment details updated successfully.');
    } else {
        helper.errorResponce(res, newRowData.err);
    }
});






module.exports = router;