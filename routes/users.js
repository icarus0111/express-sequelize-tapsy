const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const UserModel = require('../db/models').user;
const CategoryModel = require('../db/models').category;
const ServiceModel = require('../db/models').service;
const ConnModel = require('../db/models').connection;
const VendorDetailModel = require('../db/models').vendor_detail;
const helper = require('../config/helperMethods');
const Notification = require('../config/pushNotification');
const Twilio = require('../config/twillo');
const connMethods = require('../config/connectionMethods');
const vendorDetailMethods = require('../config/vendorDetailsMethod');
const paymentDetailMethods = require('../config/paymentDetailsMethod');



//-------------------------------------------------------------
//  creating users
//-------------------------------------------------------------
router.post('/register', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    requestData.password = await helper.encryptPassword(requestData.password);
    requestData.otp = await helper.generateRandomNumber(6);
    requestData.username = `cus${requestData.phone}`;
    requestData.active = 0;

    console.log('payload : ', requestData);


    UserModel.create(
        requestData, {
            raw: true
        }).then(async(user) => {
        console.log('registered user data : ', user.dataValues);
        // delete user.dataValues.otp;
        delete user.dataValues.password;
        delete user.dataValues.username;

        let payload = {
            user_id: user.dataValues.id
        }

        let createdConn = await connMethods.createNewConnRow(payload);

        if (createdConn.status) {

            if (requestData.role_id == 3) {
                //creating vendor details row only for vendors
                let payload1 = {
                    vendor_id: user.dataValues.id
                }
                var vendorDetails = await vendorDetailMethods.createNewRow(payload1);
                if (vendorDetails.status) {
                    helper.sendEmailWithPromise(requestData.email, user.dataValues.name, user.dataValues.otp).then((data) => {

                        delete user.dataValues.otp;
                        if (data.messageId) {
                            console.log('Email data :...........', data.messageId);
                            // helper.successResponce(res, 'OTP send successfully.', customer.dataValues);
                            helper.successResponce(res, 'Registration successfully.', user.dataValues);
                        } else {
                            helper.errorResponce(res, `OTP sent error. Please try again.`);
                        }
                    }).catch((err) => {
                        console.log(err);
                        if (err && err.errors && err.errors.length > 0) {
                            helper.errorResponce(res, `${err.errors[0].message}`);
                        } else {
                            helper.errorResponce(res, `OTP sent error. Please try again.`);
                        }
                    });

                } else {
                    helper.errorResponce(res, `Server not responding`);
                }
            } else {
                helper.sendEmailWithPromise(requestData.email, user.dataValues.name, user.dataValues.otp).then((data) => {

                    delete user.dataValues.otp;
                    if (data.messageId) {
                        console.log('Email data :...........', data.messageId);
                        // helper.successResponce(res, 'OTP send successfully.', customer.dataValues);
                        helper.successResponce(res, 'Registration successfully.', user.dataValues);
                    } else {
                        helper.errorResponce(res, `OTP sent error. Please try again.`);
                    }
                }).catch((err) => {
                    console.log(err);
                    if (err && err.errors && err.errors.length > 0) {
                        helper.errorResponce(res, `${err.errors[0].message}`);
                    } else {
                        helper.errorResponce(res, `OTP sent error. Please try again.`);
                    }
                });
            }
        } else {
            helper.errorResponce(res, `Server not responding`);
        }
    }).catch(err => {
        console.log('register error : ...................', err);
        if (err.errors[0].type == 'unique violation') {
            helper.errorResponce(res, `You are already registered.`);
        } else if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        } else {
            helper.errorResponce(res, `Server not responding`);
        }
    });
});




//-------------------------------------------------------------
//  customer login and register with phone
//-------------------------------------------------------------
router.post('/login', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    // console.log(requestData);
    UserModel.findOne({
        attributes: ['id', 'name', 'phone', 'email', 'role_id', 'otp'],
        where: {
            phone: requestData.phone,
            role_id: requestData.role_id
        },
        limit: 1,
        include: [{
            model: VendorDetailModel,
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            as: 'vendor_details',
            where: {
                // id: Sequelize.col('user.id'),
                active: 1
            },
            required: false
        }]
    }).then(async(customer) => {
        // console.log('Found customer : ...................', customer);
        if (customer && customer.dataValues && customer.dataValues.phone) {
            console.log('Found customer : ...................', customer.dataValues);

            Twilio.sendMsg(customer.dataValues.phone, customer.dataValues.otp).then(async data => {
                delete customer.dataValues.otp;
                // let token = await helper.generateJwtToken(customer.dataValues);
                helper.successResponce(res, 'User found Successfully', customer);
            }).catch(err => {
                console.log('send sending error :......', err);
                helper.errorResponce(res, `OTP sent fail. Please try again.`);
            });
        } else {
            let cusData = await helper.registerCustomer(requestData);
            // console.log('new customer data :..........', cusData);
            if (cusData.status) {
                //creating connection row after register
                let payload = {
                    user_id: cusData.customer.id
                }
                let createdConn = await connMethods.createNewConnRow(payload);

                if (createdConn.status) {

                    if (requestData.role_id == 3) {
                        //creating vendor details row only for vendors
                        let payload1 = {
                            vendor_id: cusData.customer.id
                        }
                        var vendorDetails = await vendorDetailMethods.createNewRow(payload1);
                        if (vendorDetails.status) {

                            Twilio.sendMsg(cusData.customer.phone, cusData.customer.otp).then(async data => {
                                delete cusData.customer.otp;
                                // let token = await helper.generateJwtToken(cusData.customer);
                                helper.successResponce(res, 'User found successfully.', cusData.customer);
                            }).catch(err => {
                                console.log('send sending error :......', err);
                                helper.errorResponce(res, `OTP sent fail. Please try again.`);
                            });
                        } else {
                            throw new Error(vendorDetails.err);
                        }
                    } else {
                        Twilio.sendMsg(cusData.customer.phone, cusData.customer.otp).then(async data => {
                            delete cusData.customer.otp;
                            // let token = await helper.generateJwtToken(cusData.customer);
                            helper.successResponce(res, 'User found successfully.', cusData.customer);
                        }).catch(err => {
                            console.log('send sending error :......', err);
                            helper.errorResponce(res, `OTP sent fail. Please try again.`);
                        });
                    }
                } else {
                    // throw new Error(createdConn.err);
                    helper.errorResponce(res, `Something went wrong. Please try again.`);
                }
            } else {
                console.log('register error: ...................', cusData.err);
                if (cusData.err && cusData.err.errors && cusData.err.errors.length > 0) {
                    helper.errorResponce(res, `${cusData.err.errors[0].message}`);
                } else {
                    helper.errorResponce(res, `Something went wrong.`);
                }
            }
        }
    }).catch((err) => {
        console.log('Found admin error: ...................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    });
});






//-------------------------------------------------------------
//  customer login and register with email
//-------------------------------------------------------------
router.post('/loginWithEmail', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    // console.log(requestData);
    UserModel.findOne({
        attributes: ['id', 'name', 'phone', 'email', 'role_id', 'otp'],
        where: {
            email: requestData.email,
            role_id: requestData.role_id
        },
        limit: 1,
        include: [{
            model: VendorDetailModel,
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            as: 'vendor_details',
            where: {
                // id: Sequelize.col('user.id'),
                active: 1
            },
            required: false
        }]
    }).then(async(customer) => {
        // console.log('Found customer : ...................', customer);
        if (customer && customer.dataValues && customer.dataValues.email) {
            // console.log('Found customer : ...................', customer.dataValues);
            helper.sendEmailWithPromise(requestData.email, customer.dataValues.name, customer.dataValues.otp).then((data) => {

                delete customer.dataValues.otp;
                if (data.messageId) {
                    console.log('Email data :...........', data.messageId);
                    helper.successResponce(res, 'OTP send successfully.', customer.dataValues);
                } else {
                    helper.errorResponce(res, `Email sent error. Please try again.`);
                }
            }).catch((err) => {
                if (err && err.errors && err.errors.length > 0) {
                    helper.errorResponce(res, `${err.errors[0].message}`);
                } else {
                    helper.errorResponce(res, `Email sent error. Please try again.`);
                }
            });
        } else {
            helper.errorResponce(res, `Sorry, you are not registered`);
        }
    }).catch((err) => {
        console.log('Found user error: ...................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Server not responding.`);
        }
    });
});






//-------------------------------------------------------------
//  customer change password route
//-------------------------------------------------------------
router.post('/changePassword', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    const { email, old_password, new_password, confirm_password } = requestData;

    console.log('bady data for change pass >>>>>>>> ', requestData);

    if (new_password !== confirm_password) {
        helper.errorResponce(res, `Password not matched.`);
    }

    UserModel.findOne({
        attributes: ['email', 'password'],
        raw: true,
        where: {
            email: email,
            active: 1
        }
    }).then(async(data) => {
        console.log('found user >>>>>>>>>>>>>>>:........... ', data);
        if (data && data.email) {
            let isPassValid = await helper.comparePassword(old_password, data.password);
            if (isPassValid) {
                console.log('password valid >>>>>>>>>>>>>>>:........... ', isPassValid);

                let newPass = {
                    password: await helper.encryptPassword(new_password)
                }

                UserModel.update(newPass, {
                    where: {
                        email: email,
                        active: 1
                    }
                }).then(async(data) => {
                    if (data && data.length > 0) {
                        console.log('updated user >>>>>>>>>:........... ', data);
                        helper.successResponce(res, 'Password changed successfully.');
                    }
                }).catch((err) => {
                    helper.errorResponce(res, `Server not responding`);
                });
            } else {
                helper.errorResponce(res, `Invalid credential.`);
            }
        } else {
            // helper.successResponce(res, 'User Not Found.');
            helper.errorResponce(res, `Invalid credential.`);
        }
    }).catch(err => {
        console.log('error data >>>>>>>>>', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Server not responding`);
        }
    })
});







//-------------------------------------------------------------
//  customer forgot password route
//-------------------------------------------------------------
router.post('/forgotPassword', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    const { email, new_password, confirm_password } = requestData;

    console.log('body data : >>>>>>>>>>>>>', requestData);

    if (new_password !== confirm_password) {
        helper.errorResponce(res, `Password not matched.`);
    }

    UserModel.findOne({
        attributes: ['email'],
        raw: true,
        where: {
            email: email,
            active: 1
        }
    }).then(async(data) => {
        console.log('found user :........... ', data);
        if (data) {
            let newOtp = await helper.generateRandomNumber(6);
            UserModel.update({ otp: newOtp }, {
                    where: {
                        email: email,
                        active: 1
                    }
                }).then(async(data) => {
                    if (data && data.length > 0) {
                        console.log('updated user :........... ', data);
                        let sentMail = await helper.sendEmail(email, email, newOtp);
                        console.log('Email data :...........', sentMail);
                        helper.successResponce(res, 'OTP send successfully.');
                    }
                })
                // helper.successResponce(res, 'User fetch successfully.', [data]);
        } else {
            helper.successResponce(res, 'User Not Found.');
        }
    }).catch(err => {
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});




//-------------------------------------------------------------
//  
//-------------------------------------------------------------
router.post('/verifyOtp', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { email, new_password, confirm_password, otp } = requestData;

    if (new_password !== confirm_password) {
        helper.errorResponce(res, `Password not matched.`);
    }

    UserModel.findOne({
        attributes: ['email', 'otp'],
        raw: true,
        where: {
            email: email,
            active: 1
        }
    }).then(async(data) => {
        console.log('found user :........... ', data);
        if (data) {

            if (data.otp == otp) {

                let newPass = {
                    password: await helper.encryptPassword(new_password)
                }

                UserModel.update(newPass, {
                    where: {
                        email: email,
                        active: 1
                    }
                }).then(async(data) => {
                    if (data && data.length > 0) {
                        console.log('updated user :........... ', data);
                        helper.successResponce(res, 'Password changed successfully.');
                    }
                })

            } else {
                helper.errorResponce(res, `Invalid OTP.`);
            }

        } else {
            helper.successResponce(res, 'User Not Found.');
        }
    }).catch(err => {
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});






//-------------------------------------------------------------
//  verify mobile
//-------------------------------------------------------------
router.post('/verifymobile', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { id, otp } = requestData;

    UserModel.findOne({
        attributes: ['id', 'name', 'phone', 'email', 'role_id', 'otp'],
        raw: true,
        where: {
            id: id
        }
    }).then(async(data) => {
        console.log('found user :........... ', data);
        if (data) {

            if (data.otp == otp) {

                let newOtp = {
                    otp: await helper.generateRandomNumber(6),
                    active: 1
                }

                UserModel.update(newOtp, {
                    where: {
                        id: id
                    }
                }).then(async(updatedUserdata) => {
                    if (updatedUserdata && updatedUserdata.length > 0) {
                        // console.log('updated user :........... ', data);
                        delete data.otp;
                        let token = await helper.generateJwtToken(data);
                        helper.successResponce(res, 'Login successfully.', data, token);
                    } else {
                        helper.errorResponce(res, `Something went wrong. Please try again.`);
                    }
                })

            } else {
                helper.errorResponce(res, `Invalid OTP.`);
            }

        } else {
            helper.successResponce(res, 'User Not Found.');
        }
    }).catch(err => {
        console.log(err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});






//-------------------------------------------------------------
//  testing push notification send
//-------------------------------------------------------------
router.post('/sendNotification', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { id, additionData } = requestData;
    console.log('######## body data :....................', requestData);

    ConnModel.findOne({
        raw: true,
        where: {
            user_id: id,
            active: 1
        }
    }).then(async(data) => {
        // helper.successResponce(res, 'Data fetched successfully.', data); 

        let pushData = await Notification.sendPushNotification(additionData.title, additionData.body, additionData, data.fcm_token);
        if (pushData) {
            helper.successResponce(res, 'Push notification successfully.', pushData);
        } else {
            helper.errorResponce(res, 'Push notification Error.', pushData);
        }

    }).catch(err => {
        console.log('#########  finding user error :.......... ', err);
        helper.errorResponce(res, `Something went wrong.`);
    })
});






//-------------------------------------------------------------
//  update user data row
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    // console.log('job create body data :.............', requestData);
    let newRowData = await helper.updateUserRow(requestData);

    if (newRowData.status) {
        helper.successResponce(res, 'user updated successfully.');
    } else {
        helper.errorResponce(res, newRowData.err);
    }
});











module.exports = router;






// Find all users
// User.findAll().then(users => {
//   console.log("All users:", JSON.stringify(users, null, 4));
// });

// Create a new user
// User.create({ firstName: "Jane", lastName: "Doe" }).then(jane => {
//   console.log("Jane's auto-generated ID:", jane.id);
// });

// Delete everyone named "Jane"
// User.destroy({
//   where: {
//     firstName: "Jane"
//   }
// }).then(() => {
//   console.log("Done");
// });

// Change everyone without a last name to "Doe"
// User.update({ lastName: "Doe" }, {
//   where: {
//     lastName: null
//   }
// }).then(() => {
//   console.log("Done");
// });