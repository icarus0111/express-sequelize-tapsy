const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const CategoryModel = require('../db/models').category;
const ServiceModel = require('../db/models').service;
const CountModel = require('../db/models').subcatandservicecount;
const helper = require('../config/helperMethods');



//-------------------------------------------------------------
//  creating sub-categories
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    // if (requestData.sub_category_icon !== null && requestData.sub_category_icon !== '') {
    //     let isConverted = await helper.convertBase64ToImage(requestData.sub_category_icon, requestData.name);
    //     let ext = await helper.getExtension(requestData.sub_category_icon);
    //     // console.log('convert success :................', isConverted);
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     let imageName = await helper.imageNameSpaceRemover(requestData.name);
    //     requestData.sub_category_icon = `${imageName}.${ext}`;
    // } else {
    //     requestData.sub_category_icon = `defaultSubCatServ.png`;
    // }

    if (requestData.sub_category_icon == null || requestData.sub_category_icon == '' || requestData.sub_category_icon == undefined) {
        requestData.sub_category_icon = null;
    }

    requestData.name = await helper.convertToLowercase(requestData.name);
    requestData.category_icon = null;

    CategoryModel.create(requestData).then(subcat => {
        console.log('created sub category :................', subcat.dataValues);
        CountModel.findAll({
            attributes: ['id', 'no_of_sub_categorys'],
            where: {
                category_id: requestData.parent_id,
                active: 1
            },
            limit: 1
        }).then(count => {

            console.log('current count :................', count[0].dataValues);
            let increasedCount = count[0].dataValues.no_of_sub_categorys + 1;

            CountModel.update({
                no_of_sub_categorys: increasedCount
            }, {
                where: {
                    id: count[0].dataValues.id,
                    active: 1
                }
            }).then(countUpdated => {
                helper.successResponce(res, 'Sub-category created successfully.');
            });
        })
    }).catch(err => {
        console.log('Category error : ...................', err);
        if (err.errors[0].type == 'unique violation') {
            helper.errorResponce(res, `Sub-category name should be unique.`);
        } else {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        }
    });
});




//-------------------------------------------------------------
//  get All sub-category lists
//-------------------------------------------------------------
router.get('/list', async(req, res, next) => {
    CategoryModel.findAll({
        attributes: ['id', 'name', 'sub_category_icon'],
        where: {
            parent_id: {
                [Op.gt]: 0
            },
            active: 1
        },
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
            }
        }]
    }).then(categoryList => {
        console.log('all sub category list :................', categoryList);
        helper.successResponce(res, 'Sub-category fetched successfully.', categoryList);
    }).catch(err => {
        console.log('sub-category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  get All sub-category lists with pagination
//-------------------------------------------------------------
router.post('/listwithpagination', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('###############################       ', requestData);
    const { limit, page } = requestData;

    CategoryModel.findAndCountAll({
        attributes: ['id', 'name', 'sub_category_icon', 'updatedAt'],
        where: {
            parent_id: {
                [Op.gt]: 0
            },
            active: 1
        },
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
            }
        }],
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(categoryList => {
        console.log('all sub category list :................', categoryList);
        helper.successResponce(res, 'Sub-category fetched successfully.', categoryList);
    }).catch(err => {
        console.log('sub-category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  get sub-category by category Id
//-------------------------------------------------------------
router.post('/getSubCategoryByCategoryId', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    CategoryModel.findAll({
        attributes: ['id', 'name', 'sub_category_icon'],
        // raw: true,
        where: {
            parent_id: requestData.category_id,
            active: 1
        },
        include: [{
            model: ServiceModel,
            as: 'child_service',
            attributes: ['id', 'category_id', 'name'],
            where: {
                sub_category_id: Sequelize.col('category.id'),
                active: 1
            },
            required: false
        }, {
            model: CategoryModel,
            as: 'parent_category',
            attributes: ['id', 'name'],
            where: {
                parent_id: Sequelize.col('category.id'),
                active: 1
            }
        }]
    }).then(categoryList => {
        // console.log('all sub category list :................', categoryList);
        let savedData = categoryList;
        // console.log('all sub category list :................', savedData);
        // helper.setDataToRedisCache(`subcategory_${req.body.category_id}`, savedData);
        console.log('##################  fetch from DB #######################');
        helper.successResponce(res, 'Sub-category fetched successfully.', categoryList);
    }).catch(err => {
        // console.log('sub-category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  get particular sub-category by id
//-------------------------------------------------------------
router.post('/get', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    CategoryModel.findAll({
        attributes: ['id', 'name', 'sub_category_icon'],
        where: {
            id: requestData.id,
            parent_id: {
                [Op.gt]: 0
            },
            active: 1
        },
        limit: 1,
        include: [{
            model: CategoryModel,
            as: 'category_name',
            attributes: ['id', 'name'],
            where: {
                parent_id: Sequelize.col('category.id')
            }
        }]
    }).then(categoryList => {
        console.log('all sub category list :................', categoryList);
        helper.successResponce(res, 'Sub-category fetched successfully.', categoryList);
    }).catch(err => {
        console.log('sub-category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});





//-------------------------------------------------------------
//  update sub-category
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    // const {name, category_icon} = req.body;
    if (requestData.sub_category_icon == null || requestData.sub_category_icon == '' || requestData.sub_category_icon == undefined) {
        requestData.name = await helper.convertToLowercase(requestData.name);
        var updateData = {
            name: requestData.name,
            parent_id: requestData.parent_id,
        };
    } else {
        var updateData = {
            name: requestData.name,
            parent_id: requestData.parent_id,
            sub_category_icon: requestData.sub_category_icon
        };
    }


    // if (requestData.sub_category_icon && requestData.sub_category_icon !== null) {
    //     let isConverted = await helper.convertBase64ToImage(requestData.sub_category_icon, requestData.name);
    //     let ext = await helper.getExtension(requestData.sub_category_icon);
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     let imageName = await helper.imageNameSpaceRemover(requestData.name);
    //     requestData.sub_category_icon = `${imageName}.${ext}`;

    //     var updateData = {
    //         name: requestData.name,
    //         parent_id: requestData.parent_id,
    //         sub_category_icon: requestData.sub_category_icon
    //     };
    // } else {
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     var updateData = {
    //         name: requestData.name,
    //         parent_id: requestData.parent_id,
    //     };
    // }


    CategoryModel.update(updateData, {
        where: {
            id: requestData.id,
            active: 1
        }
    }).then(updatedSubCategory => {
        if (requestData.isCategoryChanged) {

            ServiceModel.update({
                category_id: requestData.parent_id
            }, {
                where: {
                    sub_category_id: requestData.id,
                    active: 1
                }
            }).then(catupdatedonservice => {
                CountModel.update({
                    no_of_sub_categorys: Sequelize.literal('no_of_sub_categorys + 1')
                }, {
                    where: {
                        category_id: requestData.parent_id,
                        active: 1
                    }
                }).then(countUpdated => {
                    CountModel.update({
                        no_of_sub_categorys: Sequelize.literal('no_of_sub_categorys - 1')
                    }, {
                        where: {
                            category_id: requestData.previous,
                            active: 1
                        }
                    }).then(countUpdated => {
                        helper.successResponce(res, 'Sub-category updated successfully.');
                    });
                });
            })
        } else {
            helper.successResponce(res, 'Sub-category updated successfully.');
        }
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});






//-------------------------------------------------------------
//  delete sub-category by id
//-------------------------------------------------------------
router.post('/delete', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    CategoryModel.update({ active: 0 }, {
        where: {
            id: requestData.id,
            active: 1
        }
    }).then(subcategory => {

        console.log('row affected sub-category:................', subcategory[0]);
        CountModel.update({
            no_of_sub_categorys: Sequelize.literal(`no_of_sub_categorys - ${subcategory[0]}`)
        }, {
            where: {
                category_id: requestData.category_id,
                active: 1
            }
        }).then(countUpdated => {

            ServiceModel.update({ active: 0 }, {
                where: {
                    sub_category_id: requestData.id,
                    active: 1
                }
            }).then(countUpdated => {

                console.log('row affected service :................', countUpdated[0]);
                CountModel.update({
                    no_of_services: Sequelize.literal(`no_of_services - ${countUpdated[0]}`)
                }, {
                    where: {
                        category_id: requestData.category_id,
                        active: 1
                    }
                }).then(countUpdated => {
                    helper.successResponce(res, 'Sub-Category deleted successfully.');
                })
            })
        })
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});




module.exports = router;