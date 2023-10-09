require('../db_functions');
let Administration = require('../models/Administration');
let helpers = require('../services/helper');
let jwt = require('jsonwebtoken');
let md5 = require('md5');
const ResponseMessages = require('../constants/ResponseMessages');
const consts = require('../constants/const');
const { default: mongoose } = require('mongoose');
const Material = require('../models/Material');
const Users = require('../models/Users');

const adminUtils = {

    login: async (data) => {
        let { email, password } = data;
        let where = {
            email: email,
            password: md5(password),
            status: { $eq: 1 }
        }
        let result = await getSingleData(Administration, where, '');
        if (result.status) {
            let adminData = result?.data
            let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
            let access_token = jwt.sign({ user_type: "admin", type: "access", _id: adminData?._id }, API_SECRET, {
                expiresIn: consts.ACCESS_EXPIRY
            });
            // let refresh_token = jwt.sign({ user_type: "admin", type: "refresh" }, API_SECRET, {
            //     expiresIn: consts.REFRESH_EXPIRY
            // });
            delete adminData?._doc?.password
            adminData = { ...adminData?._doc, token: access_token }

            return helpers.showResponse(true, ResponseMessages?.admin?.login_success, adminData, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.admin?.invalid_login, null, null, 400);
    },

    addMaterial: async (data) => {
        try {
            const { name } = data
            const findMaterial = await getSingleData(Material, { name: name })
            if (findMaterial.status) {
                return helpers.showResponse(false, ResponseMessages?.material.material_already, {}, null, 403);
            }

            let obj = {
                name,
                createdOn: helpers.getCurrentDate(),
            }
            let materialRef = new Material(obj)
            let result = await postData(materialRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.material.material_save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.material.material_created, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    getAllUsers: async (data) => {
        try {
            let { sortColumn = 'createdOn', sortDirection = 'asc', pageIndex = 1, pageSize = 5, searchKey = '' } = data
            pageIndex = Number(pageIndex)
            pageSize = Number(pageSize)

            console.log(pageIndex, pageSize, "pagina")
            console.log(sortColumn, sortDirection, searchKey, "extraa")

            const result = await Users.aggregate([
                {
                    $match: {
                        $or: [
                            { email: { $regex: searchKey, $options: 'i' } },
                            // {
                            //     $expr: {
                            //       $regexMatch: {
                            //         input: "$userProfileData.shippingAddress.companyName",
                            //         regex: searchKey,
                            //         options: "i"
                            //       }
                            //     }
                            //   }
                        ]
                    }
                },
                {
                    $skip: (pageIndex - 1) * pageSize

                },
                {
                    $limit: pageSize

                },
                {
                    $sort: {
                        [sortColumn]: sortDirection == 'asc' ? 1 : -1
                    }
                },
                {
                    $lookup: {
                        from: "userProfile",
                        localField: "_id",
                        foreignField: "userId",
                        as: "userProfileData",
                        // pipeline:[{
                        //     $match:{
                        //         // 'userProfileData.shippingAddress.companyname': { $regex: searchKey, $options: 'i'  },
                        //         $expr: {
                        //           $regexMatch: {
                        //             input: "$userProfileData.shippingAddress.companyName",
                        //             regex: searchKey,
                        //             options: "i"
                        //           }
                        //         }
                        //     }
                        // }]
                    }
                },
                {
                    $unwind: '$userProfileData'
                },
                {
                    $addFields: {
                        shippingAddress: '$userProfileData.shippingAddress'
                    }
                },
               
                // {
                //     $unset: 'userProfileData'
                // },
                

            ])

            // if (!result.length===0) {
            //     return helpers.showResponse(false, ResponseMessages?.material.material_save_failed, result?.data, null, 400);
            // }

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    // forgotPasswordMail: async (data) => {
    //     try {
    //         let { email } = data;
    //         let queryObject = { email: { $eq: email } }
    //         let result = await getSingleData(Administration, queryObject, '');
    //         if (result.status) {
    //             let otp = helpers.randomStr(4, "1234567890");
    //             let editObj = {
    //                 otp,
    //                 updated_on: moment().unix()
    //             }
    //             let response = await updateData(Administration, editObj, ObjectId(result.data._id))
    //             if (response.status) {
    //                 let to = email
    //                 let subject = `Reset Password Code`
    //                 let body = `
    //                     <div style="background-color: #f2f2f2; padding: 20px;">
    //                         <h2 style="color: #333333;">Forgot Password</h2>
    //                         <p style="color: #333333;">Hello Administrator,</p>
    //                         <p style="color: #333333;">We have received a request to reset your password. If you did not initiate this request, please ignore this email.</p>
    //                         <p style="color: #333333;">To reset your password, please use this OTP (One Time Password):</p>
    //                         <h3 style="color: #333333; text-align: center">${otp}</h3>
    //                         <p style="color: #333333;">Thank you,</p>
    //                         <p style="color: #333333;">Rico Support Team</p>
    //                     </div>
    //                 `
    //                 let emailResponse = await helpers.sendEmailService(to, subject, body)
    //                 if (emailResponse?.status) {
    //                     return helpers.showResponse(true, ResponseMessages?.admin?.forgot_password_email_sent, null, null, 200);
    //                 }
    //                 return helpers.showResponse(false, ResponseMessages?.admin?.forgot_password_email_error, null, null, 200);
    //             }
    //             return helpers.showResponse(false, ResponseMessages?.admin?.admin_account_error, null, null, 200);
    //         }
    //         return helpers.showResponse(false, ResponseMessages?.admin?.invalid_email, null, null, 200);
    //     } catch (err) {
    //         console.log("admin in catch", err)
    //         return helpers.showResponse(false, ResponseMessages?.admin?.forgot_password_email_error, null, null, 200);
    //     }
    // },
    // forgotChangePassword: async (data) => {
    //     let { otp, email, password } = data;
    //     let queryObject = { email, otp, status: { $ne: 2 } }
    //     let result = await getSingleData(Administration, queryObject, '');
    //     if (result.status) {
    //         let editObj = {
    //             otp: '',
    //             password: md5(password),
    //             updated_at: moment().unix()
    //         }
    //         let response = await updateData(Administration, editObj, ObjectId(result.data._id));
    //         if (response.status) {
    //             return helpers.showResponse(true, ResponseMessages?.admin?.admin_password_reset, null, null, 200);
    //         }
    //         return helpers.showResponse(false, ResponseMessages?.admin?.admin_password_reset_error, null, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.invalid_otp, null, null, 200);
    // },
    // getDetails: async (admin_id) => {
    //     let queryObject = { _id: ObjectId(admin_id), status: { $ne: 2 } }
    //     let result = await getSingleData(Administration, queryObject, '-password -access_token -refresh_token');
    //     if (result.status) {
    //         return helpers.showResponse(true, ResponseMessages?.admin?.admin_details, result.data, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.invalid_admin, null, null, 200);
    // },
    // changePasswordWithOld: async (data, admin_id) => {
    //     let { old_password, new_password } = data
    //     let queryObject = { _id: ObjectId(admin_id), password: md5(old_password), status: { $ne: 2 } }
    //     let result = await getSingleData(Administration, queryObject, '');
    //     if (!result.status) {
    //         return helpers.showResponse(false, ResponseMessages?.admin?.invalid_old_password, null, null, 200);
    //     }
    //     let editObj = {
    //         password: md5(new_password),
    //         updated_on: moment().unix()
    //     }
    //     let response = await updateData(Administration, editObj, ObjectId(admin_id));
    //     if (response.status) {
    //         return helpers.showResponse(true, ResponseMessages?.admin?.password_changed, null, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.password_change_error, null, 200);
    // },
    // update: async (data, admin_id) => {
    //     if ("email" in data && data.email != "") {
    //         let queryObject = { _id: { $ne: ObjectId(admin_id) }, email: data.email, status: { $ne: 2 } }
    //         let result = await getSingleData(Administration, queryObject, '');
    //         if (result.status) {
    //             return helpers.showResponse(false, ResponseMessages?.admin?.email_already, null, null, 200);
    //         }
    //     }
    //     data.updated_on = moment().unix();
    //     let response = await updateData(Administration, data, ObjectId(admin_id));
    //     if (response.status) {
    //         return helpers.showResponse(true, ResponseMessages?.admin?.admin_details_updated, null, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.admin_details_update_error, null, null, 200);
    // },
    // getAdminData: async (data) => {
    //     try {
    //         let result = await CommonContent.findOne({})
    //         if (result) {
    //             return helpers.showResponse(true, ResponseMessages.common.data, result, null, 200);
    //         }
    //         return helpers.showResponse(true, ResponseMessages.report.not_found, null, null, 200);

    //     } catch (error) {
    //         return helpers.showResponse(false, error?.message, null, null, 200);
    //     }
    // },

}

module.exports = {
    ...adminUtils
}