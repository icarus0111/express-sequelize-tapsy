const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const CategoryModel = require('../db/models').category;
const ServiceModel = require('../db/models').service;
const CountModel = require('../db/models').subcatandservicecount;
const helper = require('../config/helperMethods');
const Op = Sequelize.Op;
let middleware = require('../config/jwtMiddleware');
const multer = require('multer');
const path = require('path');


//set storage and file name of uploads
const storage = multer.diskStorage({
    destination: './public/images',
    filename: function(req, file, cb) {
        console.log('logging uploaded file : ', file);
        let name = file.originalname.split('.')[0];
        console.log('logging uploaded file name : ', name);
        name = name.substring(0, 10) + Date.now();
        console.log('logging uploaded file name with timestamp added : ', name);
        cb(null, name + path.extname(file.originalname));
    }
});


//upload initialized
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('imagefile');


//checkFileType function
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Sorry!!! Only images are allowed to upload.');
    }
}


//-------------------------------------------------------------
//  creating categories
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {
    console.log('category body data :................', req.body);
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    // if (requestData.category_icon !== null && requestData.category_icon !== '') {
    //     let isConverted = await helper.convertBase64ToImage(requestData.category_icon, requestData.name);
    //     let ext = await helper.getExtension(requestData.category_icon);
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     let imageName = await helper.imageNameSpaceRemover(requestData.name);
    //     requestData.category_icon = `${imageName}.${ext}`;
    // } else {
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     requestData.category_icon = null;
    // }

    if (requestData.category_icon == null || requestData.category_icon == '') {
        // requestData.name = await helper.convertToLowercase(requestData.name);
        requestData.category_icon = null;
    }

    requestData.name = await helper.convertToLowercase(requestData.name);
    requestData.parent_id = 0;
    requestData.sub_category_icon = null;

    console.log('category body data :................', requestData);

    CategoryModel.create(requestData).then(cat => {
        // console.log('created category :................', cat.dataValues);
        let newCountTableData = {
            category_id: cat.dataValues.id,
            no_of_sub_categorys: 0,
            no_of_services: 0
        };
        // console.log('count body data :................', newCountTableData);
        CountModel.create(newCountTableData).then(newCount => {
            // console.log('created count :................', newCount.dataValues);
            helper.successResponce(res, 'Category created successfully.');
        });
    }).catch(err => {
        // console.log('Category error : ...................', err);
        if (err.errors[0].type == 'unique violation') {
            helper.errorResponce(res, `Category name should be unique.`);
        } else {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        }
    });
});




//-------------------------------------------------------------
//  get All category lists
//-------------------------------------------------------------
router.get('/list', async(req, res, next) => {
    CategoryModel.findAll({
        attributes: ['id', 'name', 'category_icon'],
        where: {
            parent_id: 0,
            active: 1
        },
        include: [{
            model: CountModel,
            attributes: ['id', 'category_id', 'no_of_sub_categorys', 'no_of_services'],
            as: 'counts',
            where: {
                category_id: Sequelize.col('category.id')
            }
        }]
    }).then(categoryList => {
        // console.log('all category list :................', categoryList);
        helper.successResponce(res, 'Category fetched successfully.', categoryList);
    }).catch(err => {
        // console.log('category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});





//-------------------------------------------------------------
//  get All category lists with paginations
//-------------------------------------------------------------
router.post('/listwithpagination', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('###############################       ', requestData);
    const { limit, page } = requestData;

    CategoryModel.findAndCountAll({
        attributes: ['id', 'name', 'category_icon'],
        where: {
            parent_id: 0,
            active: 1
        },
        include: [{
            model: CountModel,
            attributes: ['id', 'category_id', 'no_of_sub_categorys', 'no_of_services'],
            as: 'counts',
            where: {
                category_id: Sequelize.col('category.id')
            }
        }],
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(categoryList => {
        // console.log('all category list :................', categoryList);
        helper.successResponce(res, 'Category fetched successfully.', categoryList);
    }).catch(err => {
        // console.log('category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});





//-------------------------------------------------------------
//  get particular category
//-------------------------------------------------------------
router.post('/get', async(req, res, next) => {
    // console.log('##################  fetch from DB #######################');

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    CategoryModel.findAll({
        attributes: ['id', 'name', 'category_icon'],
        where: {
            id: requestData.id,
            parent_id: 0,
            active: 1
        },
        limit: 1,
        include: [{
            model: CountModel,
            attributes: ['id', 'category_id', 'no_of_sub_categorys', 'no_of_services'],
            where: {
                category_id: Sequelize.col('category.id')
            }
        }]
    }).then(categoryList => {
        // console.log('all category list :................', categoryList);
        // helper.setDataToRedisCache(`category_${req.body.id}`, categoryList);
        // console.log('##################  fetch from DB #######################');
        helper.successResponce(res, 'Category fetched successfully.', categoryList);
    }).catch(err => {
        console.log('category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});





//-------------------------------------------------------------
//  update category
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {
    // const {name, category_icon} = req.body;
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    // if (requestData.category_icon && requestData.category_icon !== null) {
    //     let isConverted = await helper.convertBase64ToImage(requestData.category_icon, requestData.name);
    //     let ext = await helper.getExtension(requestData.category_icon);
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     let imageName = await helper.imageNameSpaceRemover(requestData.name);
    //     requestData.category_icon = `${imageName}.${ext}`;

    //     var updateData = {
    //         name: requestData.name,
    //         category_icon: requestData.category_icon
    //     };
    // } else {
    //     requestData.name = await helper.convertToLowercase(requestData.name);
    //     var updateData = {
    //         name: requestData.name,
    //     };
    // }

    requestData.name = await helper.convertToLowercase(requestData.name);

    if (requestData.category_icon == '' || requestData.category_icon == null) {
        var updateData = {
            name: requestData.name
        };
    } else {
        var updateData = {
            name: requestData.name,
            category_icon: requestData.category_icon
        };
    }

    // req.body.parent_id = 0;
    CategoryModel.update(updateData, {
        where: {
            id: requestData.id,
            parent_id: 0,
            active: 1
        }
    }).then(categoryList => {
        // console.log('all category list :................', categoryList);
        helper.successResponce(res, 'Category updated successfully.');
    }).catch(err => {
        console.log('category list fetch error :................', err);
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});




//-------------------------------------------------------------
//  delete category by id
//-------------------------------------------------------------
router.post('/delete', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    CategoryModel.update({ active: 0 }, {
        where: {
            [Op.or]: [{ id: requestData.id }, { parent_id: requestData.id }],
            active: 1
        }
    }).then(updatedcategory => {
        ServiceModel.update({ active: 0 }, {
            where: {
                category_id: requestData.id,
                active: 1
            }
        }).then(countUpdated => {
            CountModel.update({ active: 0 }, {
                where: {
                    category_id: requestData.id,
                    active: 1
                }
            }).then(countUpdated => {
                helper.successResponce(res, 'Category deleted successfully.');
            })
        }).catch(err => {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        });
    });
});






//-------------------------------------------------------------
//  image upload
//-------------------------------------------------------------
router.post('/uploadImage', function(req, res) {
    upload(req, res, (err) => {
        if (err) {
            // req.flash("error", err + '! Please Try Again.');
            // res.redirect('/');
            res.json({
                status: false,
                message: 'Image not uploaded',
                err: err
            });
        } else {
            if (req.file == undefined) {
                res.json({
                    status: false,
                    message: 'No image found',
                });
            } else {
                // res.render('index', {file: `/uploads/${req.file.filename}`, success: 'Great job! Image uploaded successfully.'});
                res.json({
                    status: true,
                    message: 'Image was uploaded successfully',
                    path: `${req.file.filename}`
                });
            }
        }
    });
});




module.exports = router;