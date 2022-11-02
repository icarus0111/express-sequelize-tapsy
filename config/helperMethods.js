const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const fs = require("fs");
var jwt = require('jsonwebtoken');
const UserModel = require('../db/models').user;
const static = require('./staticValues');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
// const fetch = require('node-fetch');
// const redis = require('redis');
// const REDIS_PORT = process.env.PORT || 6379;
// const client = redis.createClient(REDIS_PORT);
const CryptoJS = require("crypto-js");
const helpers = {};


//-------------------------------------------------------------
//  success responce method
//-------------------------------------------------------------
helpers.successResponce = async(res, msg, data = null, token = null) => {
    // return res.json({
    //     status: true,
    //     msg,
    //     statusCode: res.statusCode,
    //     token,
    //     data
    // });

    let resp = {
        status: true,
        msg,
        statusCode: res.statusCode,
        token,
        data
    };

    let encryptedResponce = {
        TAP_RES: await helpers.encryptResponceData(resp)
    }

    return res.json(encryptedResponce);
}

//-------------------------------------------------------------
//  failure responce method
//-------------------------------------------------------------
helpers.errorResponce = async(res, msg, data = null) => {
    // return res.json({
    //     status: false,
    //     msg,
    //     statusCode: res.statusCode
    //         // data
    // });

    let resp = {
        status: false,
        msg,
        statusCode: res.statusCode
    };

    let encryptedResponce = {
        TAP_RES: await helpers.encryptResponceData(resp)
    }

    return res.json(encryptedResponce);
}

//-------------------------------------------------------------
//  encrypt password method
//-------------------------------------------------------------
helpers.encryptPassword = async(password) => {
    var salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(password, salt);
}

//-------------------------------------------------------------
//  compare Password method
//-------------------------------------------------------------
helpers.comparePassword = async(password, hash) => {
    return bcrypt.compareSync(password, hash);
}

//-------------------------------------------------------------
//  generate random number method for OTP
//-------------------------------------------------------------
helpers.generateRandomNumber = async(length) => {
    return randomstring.generate({ length: length, charset: '1234567890' });
}

//-------------------------------------------------------------
//  customer register method
//-------------------------------------------------------------
helpers.registerCustomer = async(registerData) => {

    let customerRegisterData = {
        phone: registerData.phone,
        username: `cus${registerData.phone}`,
        password: await helpers.encryptPassword('12345'),
        role_id: registerData.role_id,
        otp: await helpers.generateRandomNumber(6)
    }

    if (registerData.role_id == '3') {
        customerRegisterData.approved = 0;
        customerRegisterData.active = 1;
        customerRegisterData.category_id = 54;
    }

    if (registerData.role_id == '2') {
        customerRegisterData.active = 1;
    }

    // console.log('customer create body data :.....................', customerRegisterData);

    return UserModel.create(customerRegisterData).then(user => {
        const { id, phone, role_id, otp, name, email } = user.dataValues;
        let data = { id, phone, role_id, otp, name, email };
        return { customer: data, status: true, err: null };
    }).catch(err => {
        console.log('customer create error : ', err);
        return { customer: null, status: false, err: err };
    });
}



//-------------------------------------------------------------
//  update user method
//-------------------------------------------------------------
helpers.updateUserRow = async(payload) => {

    const { id, updateData } = payload;
    console.log('vendor update data : ..........................', updateData);

    return UserModel.update(updateData, {
        where: {
            id,
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



//-------------------------------------------------------------
//  converting base64 to image
//-------------------------------------------------------------
helpers.convertBase64ToImage = async(base64, name) => {
    let ext = await helpers.getExtension(base64);
    let base64Data = await helpers.getCleanBase64(base64);
    let imageName = await helpers.convertToLowercase(name);
    imageName = await helpers.imageNameSpaceRemover(imageName);
    // console.log('trim base64 :..................', base64Data);
    return fs.writeFile(`./public/images/${imageName}.${ext}`, base64Data, 'base64', (err) => {
        if (err) {
            return false;
        } else {
            return true;
        }
    });
}


//-------------------------------------------------------------
//  get extension from base64
//-------------------------------------------------------------
helpers.getExtension = async(base64) => {
    if (base64.indexOf("jpeg") !== -1) {
        return 'jpg';
    } else if (base64.indexOf("png") !== -1) {
        return 'png';
    } else if (base64.indexOf("svg") !== -1) {
        return 'svg';
    }
}


//-------------------------------------------------------------
//  get clear base64
//-------------------------------------------------------------
helpers.getCleanBase64 = async(base64) => {
    if (base64.indexOf("jpeg") !== -1) {
        return base64.replace(/^data:image\/jpeg;base64,/, "");
    } else if (base64.indexOf("png") !== -1) {
        return base64.replace(/^data:image\/png;base64,/, "");
    }
}


//-------------------------------------------------------------
//  convert text to lowercase
//-------------------------------------------------------------
helpers.convertToLowercase = async(str) => {
    if (str !== '' && str !== null) {
        return str.toLowerCase();
    }
}


//-------------------------------------------------------------
//  convert text to lowercase
//-------------------------------------------------------------
helpers.imageNameSpaceRemover = async(name) => {
    if (name !== '' && name !== null) {
        let wordArr = name.split(' ');
        return wordArr.join('_');
    }
}



//-------------------------------------------------------------
//  generate token
//-------------------------------------------------------------
helpers.generateJwtToken = async(payload) => {
    return jwt.sign(payload, static.secret, {
        algorithm: static.algorithm,
        audience: static.audience,
        issuer: static.issuer
    });
}




//-------------------------------------------------------------
//  decrypt request data
//-------------------------------------------------------------
helpers.decryptRequestData = async(payload) => {
    try {
        const bytes = CryptoJS.AES.decrypt(payload, static.encrySecretForRequest);
        if (bytes.toString()) {
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        }
        return payload;
    } catch (e) {
        console.log(e);
    }
}




//-------------------------------------------------------------
//  encrypt responce data
//-------------------------------------------------------------
helpers.encryptResponceData = async(payload) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(payload), static.encrySecretForRequest).toString();
    } catch (e) {
        console.log(e);
    }
}




helpers.generateEmailTemplate = async(name, otp) => {
    return `
  <h1>Hi, ${name}</h1>
  <h4>Your OTP for Email verification : ${otp}</h4>
  <br>
  <br>
  <br>
  <p>Yours sincerely,</p>
  <p>Tapsy</p>
  `;
}




helpers.createEmailTranspoter = () => {

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'Gmail',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: static.senderEmail,
            pass: static.senderPass
        },
        tls: {
            rejectUnauthorized: true
        }
    });

}




helpers.mailOptions = async(sentEmailTo, name, otp) => {

    return {
        from: `"Tapsy" <sushil.webideasolution@gmail.com>`, // sender address
        to: sentEmailTo, // list of receivers
        subject: 'Tapsy Email Verification', // Subject line
        text: 'Tapsy Email Verification', // plain text body
        html: await helpers.generateEmailTemplate(name, otp) // html body
    };

}



helpers.sendEmail = async(sentEmailTo, name, otp) => {

    let mailOptions = await helpers.mailOptions(sentEmailTo, name, otp);

    // send mail with defined transport object
    return helpers.createEmailTranspoter().sendMail(mailOptions, async(error, info) => {
        console.log('sent mail info : ', info);
        console.log('sent mail Error : ', error);

        if (error) {
            return error;
        }
        return info;
    });

}





helpers.sendEmailWithPromise = async(sentEmailTo, name, otp) => {

    let mailOptions = await helpers.mailOptions(sentEmailTo, name, otp);

    // send mail with defined transport object
    return new Promise((resolve, reject) => {
        helpers.createEmailTranspoter().sendMail(mailOptions, async(error, info) => {
            // console.log('sent mail info : ', info);
            // console.log('sent mail Error : ', error);    
            if (error) {
                reject(error);
            }
            resolve(info);
        });
    });


}





helpers.getDateFormatDMnY = (date) => {
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}



//-------------------------------------------------------------
//  setting data to redis cache
//-------------------------------------------------------------
// helpers.setDataToRedisCache = (key, data) => {
//     // Set data to Redis
//     console.log('################################## setting key :................', key);
//     client.setex(key, 3600, JSON.stringify(data));
// }



//-------------------------------------------------------------
//  check redis cache for data
//-------------------------------------------------------------
// helpers.checkDataOnRedisCache = (req, res, next) => {
//     const { category_id, id } = req.body;

//     let identifire = category_id || id;
//     let key = '';
//     let type = '';

//     console.log('################################## api url :................', req.originalUrl);

//     if (req.originalUrl.indexOf('/api/category/') != -1) {
//         key = `category_${identifire}`;
//         type = 'Category';
//     } else if (req.originalUrl.indexOf('/api/subcategory/') != -1) {
//         key = `subcategory_${identifire}`;
//         type = 'Sub-category';
//     } else if (req.originalUrl.indexOf('/api/service/') != -1) {
//         key = `service_${identifire}`;
//         type = 'Service';
//     }

//     console.log('################################## fetching key :................', key);

//     client.get(key, (err, data) => {
//         if (err) throw err;
//         console.log(`##################  fetch from cache data ${data} #######################`);
//         if (data !== null) {
//             // res.send(setResponse(username, data));
//             console.log('##################  fetch from cache #######################');
//             helpers.successResponce(res, `${type} fetched successfully.`, data);
//         } else {
//             next();
//         }
//     });

// }




module.exports = helpers;





// req.csrfToken()


// data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjI1QThBMEU1RTNBMDExRTc5QjU4QzUwMTdBMEIxNEM4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjI1QThBMEU2RTNBMDExRTc5QjU4QzUwMTdBMEIxNEM4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjVBOEEwRTNFM0EwMTFFNzlCNThDNTAxN0EwQjE0QzgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjVBOEEwRTRFM0EwMTFFNzlCNThDNTAxN0EwQjE0QzgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYG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






// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJzdXMxMjMiLCJyb2xlX2lkIjoxLCJpYXQiOjE1NzIyNDIyMzEsImF1ZCI6ImF1ZGlfdGFwc3lfYXVkaWVuY2UiLCJpc3MiOiJpc3NfdGFwc3lfaXNzdWVyIn0.RJE6z02_DhqUudNIfxH7zDz-SG9mHA1rQxwqHkgOGqI