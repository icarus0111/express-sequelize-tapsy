const JobReviewModel = require('../db/models').job_review;
const helpers = {};





//-------------------------------------------------------------
//  new vendor details row create
//-------------------------------------------------------------
helpers.createNewRow = async(payload) => {
    return JobReviewModel.create(payload).then(newRowData => {
        return { newData: newRowData.dataValues, status: true, err: null };
    }).catch(err => {
        return { newData: null, status: false, err: err };
    });
}





//-------------------------------------------------------------
//  update vendor details
//-------------------------------------------------------------
// helpers.updateRow = async(payload) => {
//     const { job_id, updateData } = payload;
//     console.log('vendor update data : ..........................', updateData);

//     return PaymentDetailsModel.update(updateData, {
//         where: {
//             job_id,
//             active: 1
//         }
//     }).then(updated => {
//         return { newData: null, status: true, err: null };
//     }).catch(err => {
//         if (err && err.errors && err.errors.length > 0) {
//             return { newData: null, status: false, err: err.errors[0].message };
//         } else {
//             return { newData: null, status: false, err: 'Something went wrong' };
//         }
//     });
// }






module.exports = helpers;