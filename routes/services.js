const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ServiceModel = require('../db/models').service;
const CategoryModel = require('../db/models').category;
const CountModel = require('../db/models').subcatandservicecount;
const helper = require('../config/helperMethods');



//-------------------------------------------------------------
//  creating service
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    // if (requestData.service_icon !== null && requestData.service_icon !== '') {
    //     let isConverted = await helper.convertBase64ToImage(requestData.service_icon, requestData.name);
    //     let ext = await helper.getExtension(requestData.service_icon);
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     let imageName = await helper.imageNameSpaceRemover(requestData.name);
    //     requestData.service_icon = `${imageName}.${ext}`;
    //     // console.log('convert success :................', isConverted);
    // } else {
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     requestData.service_icon = null;
    // }

    if (requestData.service_icon == null || requestData.service_icon == '' || requestData.service_icon == undefined) {
        // requestData.name = await helper.convertToLowercase(requestData.name);
        requestData.service_icon = null;
    }

    requestData.name = await helper.convertToLowercase(requestData.name);


    ServiceModel.create(requestData).then(serv => {
        // console.log('created service :................', serv.dataValues);
        CountModel.findAll({
            attributes: ['id', 'no_of_services'],
            where: {
                category_id: requestData.category_id,
                active: 1
            }
        }).then(count => {
            let increasedCount = count[0].dataValues.no_of_services + 1;
            CountModel.update({
                no_of_services: increasedCount
            }, {
                where: {
                    category_id: requestData.category_id,
                    active: 1
                }
            }).then(countUpdated => {
                helper.successResponce(res, 'Service created successfully.');
            });
        });
        // })
    }).catch(err => {
        console.log('service error : ...................', err);
        if (err.errors[0].type == 'unique violation') {
            helper.errorResponce(res, `Service name should be unique.`);
        } else {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        }
    });
});





//-------------------------------------------------------------
//  get All services lists
//-------------------------------------------------------------
router.get('/list', async(req, res, next) => {
    ServiceModel.findAll({
        attributes: ['id', 'name', 'service_icon', 'price', 'price_2', 'price_3', 'estimate_time'],
        where: {
            active: 1
        },
        include: [{
                model: CategoryModel,
                attributes: ['id', 'name', 'parent_id'],
                as: 'sub_category',
                where: {
                    id: Sequelize.col('service.sub_category_id')
                },
                require: false
            },
            {
                model: CategoryModel,
                as: 'category_name',
                attributes: ['id', 'name'],
                where: {
                    id: Sequelize.col('service.category_id')
                },
                require: false
            }
        ]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Services fetched successfully.', serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  get All services lists with pagination 
//-------------------------------------------------------------
router.post('/listwithpagination', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('###############################       ', requestData);
    const { limit, page } = requestData;

    ServiceModel.findAndCountAll({
        attributes: ['id', 'name', 'service_icon', 'price', 'price_2', 'price_3', 'estimate_time', 'updatedAt'],
        where: {
            active: 1
        },
        include: [{
                model: CategoryModel,
                attributes: ['id', 'name', 'parent_id'],
                as: 'sub_category',
                where: {
                    id: Sequelize.col('service.sub_category_id')
                },
                require: false
            },
            {
                model: CategoryModel,
                as: 'category_name',
                attributes: ['id', 'name'],
                where: {
                    id: Sequelize.col('service.category_id')
                },
                require: false
            }
        ],
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Services fetched successfully.', serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});





//-------------------------------------------------------------
//  get particular services by id
//-------------------------------------------------------------
router.post('/get', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    ServiceModel.findAll({
        attributes: ['id', 'name', 'service_icon', 'price', 'price_2', 'price_3'],
        where: {
            id: requestData.id,
            active: 1
        },
        limit: 1,
        include: [{
            model: CategoryModel,
            attributes: ['id', 'name', 'parent_id'],
            as: 'sub-category',
            where: {
                id: Sequelize.col('service.category_id')
            },
            include: [{
                model: CategoryModel,
                as: 'category_name',
                attributes: ['id', 'name'],
                where: {
                    parent_id: Sequelize.col('sub-category.id')
                }
            }]
        }]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Services fetched successfully.', serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});





//-------------------------------------------------------------
//  get particular services by sub-category ID
//-------------------------------------------------------------
router.post('/getServiceBySubCategoryId', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    ServiceModel.findAll({
        attributes: ['id', 'name', 'service_icon', 'price', 'price_2', 'price_3'],
        where: {
            sub_category_id: requestData.sub_category_id,
            active: 1
        },
        // include: [{
        //     model: CategoryModel,
        //     attributes: ['id', 'name', 'parent_id'],
        //     as: 'sub-category',
        //     where: {
        //         id: Sequelize.col('service.category_id'),
        //         active: 1
        //     },
        //     include: [{
        //         model: CategoryModel,
        //         as: 'category_name',
        //         attributes: ['id', 'name'],
        //         where: {
        //             parent_id: Sequelize.col('sub-category.id'),
        //             active: 1
        //         }
        //     }]
        // }]
    }).then(serviceList => {
        // console.log('all services list :................', serviceList);
        helper.successResponce(res, 'Services fetched successfully.', serviceList);
    }).catch(err => {
        console.log('Services list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});





//-------------------------------------------------------------
//  update service
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    // const {name, category_icon} = req.body;
    if (requestData.service_icon && requestData.service_icon !== null) {
        // let isConverted = await helper.convertBase64ToImage(requestData.service_icon, requestData.name);
        // let ext = await helper.getExtension(requestData.service_icon);
        requestData.name = await helper.convertToLowercase(requestData.name);
        // let imageName = await helper.imageNameSpaceRemover(requestData.name);
        // requestData.service_icon = `${imageName}.${ext}`;

        var updateData = {
            name: requestData.name,
            category_id: requestData.category_id,
            sub_category_id: requestData.sub_category_id,
            service_icon: requestData.service_icon,
            price: requestData.price,
            price_2: requestData.price_2,
            price_3: requestData.price_3,
        };
    } else {
        requestData.name = await helper.convertToLowercase(requestData.name);
        var updateData = {
            name: requestData.name,
            category_id: requestData.category_id,
            sub_category_id: requestData.sub_category_id,
            price: requestData.price,
            price_2: requestData.price_2,
            price_3: requestData.price_3,
        };
    }

    ServiceModel.update(updateData, {
        where: {
            id: requestData.id,
            active: 1
        }
    }).then(updatedService => {
        if (req.body.isCategoryChanged) {
            CountModel.update({
                no_of_services: Sequelize.literal('no_of_services + 1')
            }, {
                where: {
                    category_id: requestData.category_id,
                    active: 1
                }
            }).then(countUpdated => {
                CountModel.update({
                    no_of_services: Sequelize.literal('no_of_services - 1')
                }, {
                    where: {
                        category_id: requestData.previous,
                        active: 1
                    }
                }).then(countUpdated => {
                    helper.successResponce(res, 'Service updated successfully.');
                });
            });
        } else {
            helper.successResponce(res, 'Service updated successfully.');
        }
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  delete service by id
//-------------------------------------------------------------
router.post('/delete', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    ServiceModel.update({ active: 0 }, {
        where: {
            id: requestData.id,
            active: 1
        }
    }).then(deletedservice => {
        // console.log('row affected service :.........', deletedservice[0]);

        CountModel.update({
            no_of_services: Sequelize.literal(`no_of_services - ${deletedservice[0]}`)
        }, {
            where: {
                category_id: requestData.category_id,
                active: 1
            }
        }).then(countUpdated => {
            helper.successResponce(res, 'Service Deleted successfully.');
        });
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  search for services
//-------------------------------------------------------------
router.post('/searchForservice', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { query } = requestData;

    CategoryModel.findAll({
        attributes: ['id', 'name', 'parent_id', 'category_icon', 'sub_category_icon'],
        where: {
            name: {
                [Op.substring]: `${query}`
            },
            active: 1
        },
        limit: 5,
        include: [{
            model: ServiceModel,
            as: 'child_service',
            attributes: ['id', 'category_id', 'name'],
            where: {
                sub_category_id: Sequelize.col('category.id')
            },
            required: false
        }, {
            model: CategoryModel,
            as: 'parent_category',
            attributes: ['id', 'name'],
            where: {
                parent_id: Sequelize.col('category.id')
            },
            required: false
        }]
    }).then(data => {
        // console.log('search result : ..............', data);
        if (data && data.length > 0) {
            helper.successResponce(res, 'Data fetch successfully.', data);
        } else if (data && data.length == 0) {
            // helper.successResponce(res, 'No match found.', data);
            ServiceModel.findAll({
                attributes: ['id', 'name', 'service_icon', 'price', 'price_2', 'price_3'],
                where: {
                    name: {
                        [Op.substring]: `${query}`
                    },
                    active: 1
                },
                limit: 5,
                include: [{
                        model: CategoryModel,
                        attributes: ['id', 'name', 'parent_id'],
                        as: 'sub_category',
                        where: {
                            id: Sequelize.col('service.sub_category_id')
                        },
                        require: false
                    },
                    {
                        model: CategoryModel,
                        as: 'category_name',
                        attributes: ['id', 'name'],
                        where: {
                            id: Sequelize.col('service.category_id')
                        },
                        require: false
                    }
                ]
            }).then(data => {
                if (data && data.length > 0) {
                    helper.successResponce(res, 'Data fetch successfully.', data);
                } else if (data && data.length == 0) {
                    helper.successResponce(res, 'No match found.', data);
                }
            }).catch(err => {
                helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
            })
        }
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    })
});





//-------------------------------------------------------------
//  get Price of a service for particular time
//-------------------------------------------------------------
router.get('/getServerDate&Time', async(req, res, next) => {
    // let type = '';
    let date = new Date();
    // let dMnY = helper.getDateFormatDMnY(date);
    let offset = date.getTimezoneOffset() * 60 * 1000;
    let localTime = date.getTime();
    let utcTime = localTime + offset;
    let customOffset = 10;
    let austratia_brisbane = utcTime + (3600000 * customOffset);
    let customDate = new Date(austratia_brisbane);

    let data = {
        day: customDate.getDate(),
        month: customDate.getMonth() + 1,
        year: customDate.getFullYear(),
        hour: customDate.getHours(),
        min: customDate.getMinutes(),
        second: customDate.getSeconds(),
        raw: customDate,
        dMnY: helper.getDateFormatDMnY(customDate),
        stringDate: customDate.toString()
    }

    helper.successResponce(res, 'Date And Time fetch successfully.', data);
});




module.exports = router;