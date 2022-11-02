const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const UserModel = require('../db/models').user;
const CategoryModel = require('../db/models').category;
const StateModel = require('../db/models').states;
const ConnModel = require('../db/models').connection;
const connMethods = require('../config/connectionMethods');
const vendorDetailMethods = require('../config/vendorDetailsMethod');
const helper = require('../config/helperMethods');




//-------------------------------------------------------------
//  customer login and register with phone
//-------------------------------------------------------------
// router.post('/login', async(req, res, next) => {
//     // console.log('body data :...............', req.body);
//     const { TAP_REQ } = req.body;
//     let requestData = await helper.decryptRequestData(TAP_REQ);
//     // console.log(requestData);
//     UserModel.findOne({
//         attributes: ['id', 'phone', 'role_id', 'otp'],
//         where: {
//             phone: requestData.phone,
//             // role_id: 3,
//             active: 1
//         },
//         limit: 1
//     }).then(async(customer) => {
//         // console.log('Found customer : ...................', customer);
//         if (customer && customer.dataValues && customer.dataValues.phone) {
//             // console.log('Found customer : ...................', customer[0].dataValues);
//             delete customer.dataValues.otp;
//             let token = await helper.generateJwtToken(customer.dataValues);
//             helper.successResponce(res, 'Login successfully.', customer, token);
//         } else {
//             let cusData = await helper.registerCustomer(requestData.phone);
//             // console.log('new customer data :..........', cusData);
//             if (cusData.status) {

//                 let payload = {
//                     user_id: cusData.customer.id
//                 }


//                 let createdConn = await connMethods.createNewConnRow(payload);


//                 if (createdConn.status) {
//                     let payload1 = {
//                         vendor_id: cusData.customer.id
//                     }
//                     let vendorDetails = await vendorDetailMethods.createNewRow(payload1);

//                     if (vendorDetails.status) {
//                         let token = await helper.generateJwtToken(cusData.customer);
//                         helper.successResponce(res, 'Login successfully.', cusData.customer, token);
//                     }
//                 } else {
//                     throw new Error(cusData.err);
//                 }
//             } else {
//                 throw new Error(cusData.err);
//             }
//         }
//     }).catch((err) => {
//         console.log('Found admin error: ...................', err);
//         if (err && err.errors && err.errors.length > 0) {
//             helper.errorResponce(res, `${err.errors[0].message}`);
//         } else {
//             helper.errorResponce(res, `Something went wrong.`);
//         }
//     });
// });





//-------------------------------------------------------------
//  getting all vendors list
//-------------------------------------------------------------
router.get('/list', (req, res, next) => {
    UserModel.findAll({
        attributes: {
            exclude: ['role_id', 'username', 'password', 'otp', 'active']
        },
        where: {
            active: 1,
            role_id: 3
        },
        include: [{
                model: CategoryModel,
                attributes: ['id', 'name'],
                as: 'category_details',
                where: {
                    // id: Sequelize.col('user.id'),
                    active: 1
                },
                required: false
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
    }).then(vendorList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Vendors fetched successfully.', vendorList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  vendors approved list with pagination
//-------------------------------------------------------------
router.post('/listapprovedwithpagination', async(req, res, next) => {

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
            role_id: 3,
            approved: 1
        },
        include: [{
                model: CategoryModel,
                attributes: ['id', 'name'],
                as: 'category_details',
                where: {
                    // id: Sequelize.col('user.id'),
                    active: 1
                },
                required: false
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
        ],
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(vendorList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Vendors fetched successfully.', vendorList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  vendors non-approved list with pagination
//-------------------------------------------------------------
router.post('/listnonapprovedwithpagination', async(req, res, next) => {

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
            role_id: 3,
            approved: 0
        },
        include: [{
                model: CategoryModel,
                attributes: ['id', 'name'],
                as: 'category_details',
                where: {
                    // id: Sequelize.col('user.id'),
                    active: 1
                },
                required: false
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
        ],
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(vendorList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Vendors fetched successfully.', vendorList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  get employee list that added by a company
//-------------------------------------------------------------
router.post('/getEmployeeListByCompanyId', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { id } = requestData;

    UserModel.findAll({
        attributes: {
            exclude: ['role_id', 'username', 'password', 'otp', 'active']
        },
        where: {
            active: 1,
            role_id: 3,
            otp_require: 0,
            added_by: id
        }
    }).then(vendorList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Employee fetched successfully.', vendorList);
    }).catch(err => {
        // console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  find near by vendors
//-------------------------------------------------------------
router.post('/searchForNearByVendors', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { category_id } = requestData;

    UserModel.findAll({
        attributes: {
            exclude: ['role_id', 'username', 'password', 'otp', 'active']
        },
        where: {
            category_id: category_id,
            active: 1,
            role_id: 3,
            is_available: 1
        },
        include: [
            // {
            //     model: CategoryModel,
            //     attributes: ['id', 'name'],
            //     as: 'category_details',
            //     where: {
            //         // id: Sequelize.col('user.id'),
            //         active: 1
            //     },
            //     required: false
            // },
            // {
            //     model: StateModel,
            //     attributes: ['id', 'short_name'],
            //     as: 'state_details',
            //     where: {
            //         // id: Sequelize.col('user.id'),
            //         active: 1
            //     },
            //     required: false
            // },
            {
                model: ConnModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                as: 'conn_details',
                where: {
                    active: 1
                },
                required: false
            }
        ]
    }).then(vendorList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Vendors fetched successfully for Tracking.', vendorList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        // helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    });
});








//-------------------------------------------------------------
//  Get vendor by vendor id
//-------------------------------------------------------------
router.post('/getVendorById', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { id } = requestData;

    UserModel.findAll({
        attributes: {
            exclude: ['password', 'otp', 'active']
        },
        where: {
            id: id,
            active: 1,
            role_id: 3
        },
        include: [
            // {
            //     model: CategoryModel,
            //     attributes: ['id', 'name'],
            //     as: 'category_details',
            //     where: {
            //         // id: Sequelize.col('user.id'),
            //         active: 1
            //     },
            //     required: false
            // },
            // {
            //     model: StateModel,
            //     attributes: ['id', 'short_name'],
            //     as: 'state_details',
            //     where: {
            //         // id: Sequelize.col('user.id'),
            //         active: 1
            //     },
            //     required: false
            // },
            {
                model: ConnModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                as: 'conn_details',
                where: {
                    active: 1
                },
                required: false
            }
        ]
    }).then(vendorList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Vendors fetched successfully for Tracking.', vendorList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        // helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    });
});








//-------------------------------------------------------------
//  add employee by company
//-------------------------------------------------------------
router.post('/addEmployeeByCompany', async(req, res, next) => {
    // console.log('body data :...............', req.body);
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log(' payload :..................', requestData);

    helper.registerCustomer(requestData).then((cusData) => {
        if (cusData.status) {
            let payload = {
                user_id: cusData.customer.id
            }
            connMethods.createNewConnRow(payload).then(createdConn => {
                if (createdConn.status) {
                    if (requestData.role_id == 3) {
                        let payload1 = {
                            vendor_id: cusData.customer.id,
                            isTeamAdded: 0,
                            is_added_by_company: 1,
                            is_company: 0
                        }
                        vendorDetailMethods.createNewRow(payload1).then(vendorDetails => {
                            if (vendorDetails.status) {
                                let payload3 = {
                                    id: cusData.customer.id,
                                    updateData: {
                                        details_id: vendorDetails.newData.id,
                                        otp_require: 0,
                                        added_by: requestData.added_by
                                    }
                                }

                                // console.log('details Id update payload :..................', payload3);
                                helper.updateUserRow(payload3).then(newRowData => {
                                    if (newRowData.status) {
                                        // let token = await helper.generateJwtToken(cusData.customer);
                                        helper.successResponce(res, 'Employee Added successfully.');
                                    } else {
                                        throw new Error(newRowData.err);
                                    }
                                });
                            } else {
                                throw new Error(vendorDetails.err);
                            }
                        });

                    } else {
                        // let token = await helper.generateJwtToken(cusData.customer);
                        helper.successResponce(res, 'Employee Added successfully.');
                    }
                } else {
                    throw new Error(createdConn.err);
                }
            })
        } else {
            throw new Error(cusData.err);
        }
    }).catch(err => {
        console.log('############### error :..........', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    });
    // console.log('new customer data :..........', cusData);    
});











module.exports = router;