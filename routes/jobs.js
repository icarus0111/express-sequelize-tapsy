const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const CategoryModel = require('../db/models').category;
const ServiceModel = require('../db/models').service;
const JobsModel = require('../db/models').jobs;
const UserModel = require('../db/models').user;
const JobStatusModel = require('../db/models').job_statu;
const paymentDetailsModel = require('../db/models').payment_detail;
const CountModel = require('../db/models').subcatandservicecount;
const helper = require('../config/helperMethods');
const paymentDetailMethods = require('../config/paymentDetailsMethod');
const Op = Sequelize.Op;
let middleware = require('../config/jwtMiddleware');



//-------------------------------------------------------------
//  creating jobs
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('job create body data :.............', requestData);
    const { data, image } = requestData;

    if (image != null && image != '' && image != undefined) {
        let isConverted = await helper.convertBase64ToImage(image, data.imageName);
        let ext = await helper.getExtension(image);
        data.imageName = await helper.convertToLowercase(data.imageName);
        let imageName = await helper.imageNameSpaceRemover(data.imageName);
        data.imageName = `${imageName}.${ext}`;
        // console.log('convert success :................', isConverted);
    } else {
        data.imageName = null;
    }

    JobsModel.create(data).then(async(job) => {
        console.log('##############   created job details :............', job.dataValues);

        let payload2 = {
            job_id: job.getDataValue('id'),
        }

        var paymentDetails = await paymentDetailMethods.createNewRow(payload2);

        if (paymentDetails.status) {
            helper.successResponce(res, 'Job created successfully.', job.dataValues);
        } else {
            throw new Error(paymentDetails.err);
        }

    }).catch(err => {
        console.log('Error data : ...........', err);
        if (err && err.errors.length > 0) {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        } else {
            helper.errorResponce(res, `Sorry, something went wrong. Please try again.`);
        }
    })
});











//-------------------------------------------------------------
//  all jobs list
//-------------------------------------------------------------
router.get('/list', async(req, res, next) => {
    // console.log('job create body data :.............', req.body);
    JobsModel.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'active']
        },
        where: {
            active: 1
        },
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ]
    }).then(serviceList => {
        console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Jobs fetched successfully.', serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        // helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});





//-------------------------------------------------------------
//  all jobs list with pagination
//-------------------------------------------------------------
router.post('/listwithpagination', async(req, res, next) => {
    // console.log('job create body data :.............', req.body);

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('###############################       ', requestData);
    const { limit, page } = requestData;

    JobsModel.findAndCountAll({
        attributes: {
            exclude: ['createdAt', 'active']
        },
        where: {
            active: 1
        },
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ],
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(serviceList => {
        console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Jobs fetched successfully.', serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        // helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});





//-------------------------------------------------------------
//  get jobs by job id
//-------------------------------------------------------------
router.post('/getjobbyid', async(req, res, next) => {
    // console.log('job create body data :.............', req.body);
    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { id } = requestData;

    JobsModel.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'active']
        },
        where: {
            id,
            active: 1
        },
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            },
            {
                model: paymentDetailsModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'payment_details',
                require: false
            }
        ]
    }).then(serviceList => {
        console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Jobs fetched successfully.', serviceList);
    }).catch(err => {
        console.log('job list fetch error :................', err);
        // helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});






//-------------------------------------------------------------
//  jobs list for perticular customers
//-------------------------------------------------------------
router.post('/getjobsbyuser', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { customer_id } = requestData;

    JobsModel.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'active']
        },
        where: {
            customer_id,
            active: 1
        },
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ],
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, `Jobs fetched successfully for ID ${customer_id}`, serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});






//-------------------------------------------------------------
//  jobs list for perticular customers with pagination
//-------------------------------------------------------------
router.post('/getjobsbyuserwithpagination', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { limit, page, customer_id } = requestData;

    JobsModel.findAndCountAll({
        attributes: {
            exclude: ['createdAt', 'active']
        },
        where: {
            customer_id,
            active: 1
        },
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ],
        offset: (page - 1) * limit,
        limit,
        order: [
            ['updatedAt', 'DESC']
        ],
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, `Jobs fetched successfully for ID ${customer_id}`, serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});






//-------------------------------------------------------------
//  jobs list for perticular customers
//-------------------------------------------------------------
router.post('/getjobsbyuserwithoffsetlimit', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { customer_id, offset, limit, job_status } = requestData;


    JobsModel.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'active']
        },
        where: {
            customer_id,
            job_status,
            active: 1
        },
        offset: (offset - 1) * limit,
        limit,
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, `Jobs fetched successfully for ID ${customer_id}`, serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});







//-------------------------------------------------------------
//  jobs list for perticular customers
//-------------------------------------------------------------
router.post('/getjobsbyuserwithoffsetlimits', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { customer_id, offset, limit, job_status } = requestData;


    JobsModel.findAndCountAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'active']
        },
        where: {
            customer_id,
            job_status,
            active: 1
        },
        offset: (offset - 1) * limit,
        limit,
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, `Jobs fetched successfully for ID ${customer_id}`, serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});







//-------------------------------------------------------------
//  jobs list for perticular vendors
//-------------------------------------------------------------
router.post('/getjobsbyvendorwithoffsetlimit', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { vendor_id, offset, limit, job_status } = requestData;

    console.log('############  log body data : ', requestData);

    JobsModel.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'active']
        },
        where: {
            vendor_id,
            job_status,
            active: 1
        },
        offset: (offset - 1) * limit,
        limit,
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, `Jobs fetched successfully for ID ${vendor_id}`, serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});







//-------------------------------------------------------------
//  jobs list for perticular vendor
//-------------------------------------------------------------
router.post('/getjobsbyvendor', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { vendor_id } = requestData;

    JobsModel.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'active']
        },
        where: {
            vendor_id,
            active: 1
        },
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ],
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, `Jobs fetched successfully for ID ${vendor_id}`, serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});








//-------------------------------------------------------------
//  jobs list for perticular vendor with pagination
//-------------------------------------------------------------
router.post('/getjobsbyvendorwithpagination', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    const requestData = await helper.decryptRequestData(TAP_REQ);
    const { limit, page, vendor_id } = requestData;

    console.log('body data : >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', requestData);

    JobsModel.findAndCountAll({
        attributes: {
            exclude: ['createdAt', 'active']
        },
        where: {
            vendor_id,
            active: 1
        },
        include: [{
                model: ServiceModel,
                attributes: {
                    exclude: ['createdAt', 'active', 'estimate_time', 'price', 'price_2', 'price_3', 'service_icon']
                },
                as: 'service_details',
                require: false,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service_details.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service_details.category_id')
                        },
                        require: false
                    }
                ]
            },
            {
                model: UserModel,
                attributes: {
                    exclude: ['createdAt', 'active']
                },
                as: 'vendor_details',
                require: false
            },
            {
                model: JobStatusModel,
                // attributes: {
                //     exclude: ['createdAt', 'updatedAt', 'active']
                // },
                as: 'status_details',
                require: false
            }
        ],
        offset: (page - 1) * limit,
        limit,
        order: [
            ['updatedAt', 'DESC']
        ],
    }).then(serviceList => {
        console.log('job list >>>>>>>>>>>>>>>>>>> :...', serviceList);
        helper.successResponce(res, `Jobs fetched successfully for ID ${vendor_id}`, serviceList);
    }).catch(err => {
        console.log('job list fetch error :................', err);
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `${err.errors[0].message}`);
        } else {
            helper.errorResponce(res, `Something went wrong.`);
        }
    })
});







//-------------------------------------------------------------
//  update job
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    // console.log('job create body data :.............', requestData);
    const { id, updateData } = requestData;

    JobsModel.update(updateData, {
        where: {
            id: id,
            active: 1
        }
    }).then(categoryList => {
        // console.log('all category list :................', categoryList);
        helper.successResponce(res, 'Jobs updated successfully.');
    }).catch(err => {
        if (err && err.errors && err.errors.length > 0) {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        } else {
            helper.errorResponce(res, `Sorry, something went wrong. Please try again.`);
        }
    });

});






module.exports = router;