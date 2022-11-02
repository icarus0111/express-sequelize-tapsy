const express = require('express');
const router = express.Router();
const helper = require('../config/helperMethods');
const jobReviewMethod = require('../config/jobReviewMethods');





//-------------------------------------------------------------
//  job review create
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    let newRowData = await jobReviewMethod.createNewRow(requestData);

    if (newRowData.status) {
        helper.successResponce(res, 'Review submitted successfully.');
    } else {
        helper.errorResponce(res, newRowData.err);
    }
});






module.exports = router;