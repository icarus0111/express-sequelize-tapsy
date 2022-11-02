const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const CategoryModel = require('../db/models').category;
const brandModel = require('../db/models').brand;
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
        console.log('logging uploaded file : ', name);
        name = name.substring(0, 10) + Date.now();
        console.log('logging uploaded file : ', name);
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
//  creating brands
//-------------------------------------------------------------
router.post('/create', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    console.log('brand body data :................', requestData);

    if (requestData.logo == null || requestData.logo == '') {
        requestData.logo = null;
    }

    requestData.name = await helper.convertToLowercase(requestData.name);

    brandModel.create(requestData).then(cat => {
        helper.successResponce(res, 'Brand created successfully.');
    }).catch(err => {
        if (err.errors[0].type == 'unique violation') {
            helper.errorResponce(res, `Brand name should be unique.`);
        } else {
            helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
        }
    });
});




//-------------------------------------------------------------
//  get All brand lists
//-------------------------------------------------------------
router.post('/list', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);
    const { limit, page } = requestData;

    brandModel.findAndCountAll({
        attributes: ['id', 'name', 'logo'],
        where: {
            active: 1
        },
        limit: limit,
        offset: (page - 1) * limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(list => {
        helper.successResponce(res, 'Brand fetched successfully', list);
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});




//-------------------------------------------------------------
//  get All brand lists
//-------------------------------------------------------------
router.get('/allList', async(req, res, next) => {
    brandModel.findAll({
        attributes: ['id', 'name', 'logo'],
        where: {
            active: 1
        }
    }).then(list => {
        helper.successResponce(res, 'Brand fetched successfully', list);
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});




//-------------------------------------------------------------
//  get particular category
//-------------------------------------------------------------
// router.post('/get', async(req, res, next) => {
//     // console.log('##################  fetch from DB #######################');

//     const { TAP_REQ } = req.body;
//     let requestData = await helper.decryptRequestData(TAP_REQ);

//     CategoryModel.findAll({
//         attributes: ['id', 'name', 'category_icon'],
//         where: {
//             id: requestData.id,
//             parent_id: 0,
//             active: 1
//         },
//         limit: 1,
//         include: [{
//             model: CountModel,
//             attributes: ['id', 'category_id', 'no_of_sub_categorys', 'no_of_services'],
//             where: {
//                 category_id: Sequelize.col('category.id')
//             }
//         }]
//     }).then(categoryList => {
//         helper.successResponce(res, 'Category fetched successfully.', categoryList);
//     }).catch(err => {
//         console.log('category list fetch error :................', err);
//         helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
//     });
// });





//-------------------------------------------------------------
//  update category
//-------------------------------------------------------------
router.post('/update', async(req, res, next) => {
    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    requestData.name = await helper.convertToLowercase(requestData.name);

    console.log('#########   update data : ', requestData);
    console.log('#########   update data logo : ', requestData.logo);

    if (requestData.logo == '' || requestData.logo == null) {
        var updateData = {
            name: requestData.name
        };
    } else {
        var updateData = {
            name: requestData.name,
            logo: requestData.logo
        };
    }

    // req.body.parent_id = 0;
    console.log('#########   update data : ', updateData);
    brandModel.update(updateData, {
        where: {
            id: requestData.id,
            active: 1
        }
    }).then(categoryList => {
        helper.successResponce(res, 'Brand updated successfully.');
    }).catch(err => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
    });
});




//-------------------------------------------------------------
//  delete brand by id
//-------------------------------------------------------------
router.post('/delete', async(req, res, next) => {

    const { TAP_REQ } = req.body;
    let requestData = await helper.decryptRequestData(TAP_REQ);

    brandModel.update({ active: 0 }, {
        where: {
            // [Op.or]: [{ id: requestData.id }, { parent_id: requestData.id }],
            id: requestData.id,
            active: 1
        }
    }).then(updatedcategory => {
        helper.successResponce(res, 'Brand deleted successfully.');
    }).catch((err) => {
        helper.errorResponce(res, `Sorry, ${err.errors[0].message}.`);
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