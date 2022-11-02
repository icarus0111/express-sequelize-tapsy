const express = require('express');
const router = express.Router();
const helper = require('../config/helperMethods');
const stripe = require("stripe")("sk_test_tPC0Gv1SIIYOLIrYvbPdHdPh00HVMA6xST");


//-------------------------------------------------------------
//  get payment on hold
//-------------------------------------------------------------
router.post('/createCharge', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { amount, token, description } = requestData;

    stripe.charges.create({
            amount: amount,
            currency: 'aud',
            source: token,
            description: description,
            capture: false
        },
        function(err, charge) {
            // asynchronously called
            if (err) {
                console.log(err);
                helper.errorResponce(res, `Something wrong with the payment. please try again.`);
            } else {
                console.log('########## pay charge data :................', charge);
                helper.successResponce(res, 'charge created successfully.', charge.id);
            }
        }
    );
});




//-------------------------------------------------------------
//  capture payment from a hold payment
//-------------------------------------------------------------
router.post('/getPayment', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { charge_id } = requestData;

    stripe.charges.capture(
        charge_id,
        function(err, charge) {
            // asynchronously called
            if (err) {
                console.log(err);
                helper.errorResponce(res, `Something wrong with the payment. please try again.`);
            } else {
                console.log('########## pay charge data :................', charge);
                helper.successResponce(res, 'Payment successfully.', charge);
            }
        }
    );
});






//-------------------------------------------------------------
//  refund a charge
//-------------------------------------------------------------
router.post('/getRefund', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { charge_id } = requestData;

    stripe.refunds.create({ charge: charge_id },
        function(err, refund) {
            // asynchronously called
            if (err) {
                console.log(err);
                helper.errorResponce(res, `Something wrong with the payment. please try again.`);
            } else {
                console.log('########## pay charge data :................', refund);
                helper.successResponce(res, 'Refund successfully.', refund);
            }
        }
    );
});




// stripe.refunds.create(
//     {charge: 'ch_1FoWfpGyJck0KUUW1nNtzfHZ'},
//     function(err, refund) {
//       // asynchronously called
//     }
// );
module.exports = router;