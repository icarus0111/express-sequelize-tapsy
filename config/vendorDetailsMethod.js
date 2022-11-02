const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const fs = require("fs");
var jwt = require('jsonwebtoken');
const UserModel = require('../db/models').user;
const static = require('./staticValues');
const ConnModel = require('../db/models').connection;
const VendorDetailsModel = require('../db/models').vendor_detail;
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
    console.log('vendor details payload :..................', payload);
    return VendorDetailsModel.create(payload).then(newRowData => {
        console.log('vendor details created data :.....................', newRowData.dataValues);
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
    const { vendor_id, updateData } = payload;
    console.log('vendor update data : ..........................', updateData);

    return VendorDetailsModel.update(updateData, {
        where: {
            vendor_id,
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