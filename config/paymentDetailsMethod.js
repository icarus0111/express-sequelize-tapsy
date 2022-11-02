const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const fs = require("fs");
var jwt = require('jsonwebtoken');
const UserModel = require('../db/models').user;
const static = require('./staticValues');
const ConnModel = require('../db/models').connection;
const VendorDetailsModel = require('../db/models').vendor_detail;
const PaymentDetailsModel = require('../db/models').payment_detail;
// const fetch = require('node-fetch');
// const redis = require('redis');
// const REDIS_PORT = process.env.PORT || 6379;
// const client = redis.createClient(REDIS_PORT);
const CryptoJS = require("crypto-js");
const helpers = {};





//-------------------------------------------------------------
//  new vendor details row create
//-------------------------------------------------------------
helpers.createNewRow = async(payload) => {
    console.log('payment details payload :..................', payload);
    return PaymentDetailsModel.create(payload).then(newRowData => {
        console.log('payment details created data :.....................', newRowData.dataValues);
        return { newData: newRowData.dataValues, status: true, err: null };
    }).catch(err => {
        // console.log('customer create error :.....................', err);
        return { newData: null, status: false, err: err };
    });
}





//-------------------------------------------------------------
//  update vendor details
//-------------------------------------------------------------
helpers.updateRow = async(payload) => {
    const { job_id, updateData } = payload;
    console.log('vendor update data : ..........................', updateData);

    return PaymentDetailsModel.update(updateData, {
        where: {
            job_id,
            active: 1
        }
    }).then(updated => {
        return { newData: null, status: true, err: null };
    }).catch(err => {
        if (err && err.errors && err.errors.length > 0) {
            return { newData: null, status: false, err: err.errors[0].message };
        } else {
            return { newData: null, status: false, err: 'Something went wrong' };
        }
    });
}






module.exports = helpers;