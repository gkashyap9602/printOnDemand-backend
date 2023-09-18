require('../db_functions');
let Users = require('../models/Users');
let UserProfile = require('../models/UserProfile')
let ObjectId = require('mongodb').ObjectID;
let jwt = require('jsonwebtoken');
let helpers = require('../services/helper');
const md5 = require('md5');
const path = require('path')
const ResponseMessages = require('../constants/ResponseMessages');
const consts = require("../constants/const");
const { default: mongoose } = require('mongoose');
const { randomUUID } = require('crypto')
const middleware = require('../controllers/middleware');
const UserUtils = {

    checkEmailExistance: async (email, user_id = null) => {
        let queryObject = { email }
        if (user_id) {
            queryObject = { email, _id: { $ne: ObjectId(user_id) } }
        }
        let result = await getSingleData(Users, queryObject, '');
        console.log(result, "result checkEmailExistance")
        if (result?.status) {
            return helpers.showResponse(false, ResponseMessages.users.email_already, result?.data, null, 200);
        }
        return helpers.showResponse(true, ResponseMessages?.users?.valid_email, null, null, 200);
    },
    checkUserExistance: async (user_id, guid = null) => {
        let queryObject = { _id: user_id }
        if (guid) {
            queryObject = { user_id, guid }
        }
        let result = await getSingleData(Users, queryObject, '');
        console.log(result, "result checkUserExistance")
        if (result?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, result?.data, null, 200);
        }
        return helpers.showResponse(true, ResponseMessages?.users?.valid_username, null, null, 200);
    },
    register: async (data) => {
        try {
            let { firstName, lastName, email, password } = data;

            let emailExistanceResponse = await UserUtils.checkEmailExistance(email)
            console.log(emailExistanceResponse, "emailExistanceResponse")
            if (!emailExistanceResponse?.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.email_already, null, null, 400);
            }
            const usersCount = await getCount(Users, { userType: 3 })
            if (!usersCount.status) {
                return helpers.showResponse(false, ResponseMessages?.common.database_error, null, null, 400);
            }
            const idGenerated = helpers.generateIDs(usersCount?.data)

            let newObj = {
                firstName,
                lastName,
                email: email,
                userName: email,
                id: idGenerated.idNumber,
                guid: randomUUID(),
                customerId: idGenerated.customerID,
                customerGuid: randomUUID(),
                password: md5(password),
                createdOn: helpers.getCurrentDate()
            }

            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                delete data.password
                let ObjProfile = {
                    user_id: result.data._id,
                    completionStaus: {
                        basicInfo: true
                    },

                    createdOn: helpers.getCurrentDate()
                }
                let userProfileRef = new UserProfile(ObjProfile)
                let resultProfile = await postData(userProfileRef);
                if (!resultProfile.status) {
                    // console.log(resultProfile, "resultProfile")
                    await deleteData(Users, { _id: userRef._id })
                    return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 402);
                }

                let link = `${consts.FRONTEND_URL}/login`
                let to = email
                let subject = `Welcome to the MWW on Demand Merch Maker!`
                const logoPath = path.join(__dirname, '../views', 'logo.png');
                let attachments = [{
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'unique@mwwLogo'
                }]

                let body = `
                 <!DOCTYPE html>
                         <html>
                         <head>
                         </head>
                         <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
     
                             <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
     
                                 <div style="text-align: center; padding: 10px;">
                                     <img src="cid:unique@mwwLogo" alt="logo" style="max-height: 75px;" />
                                 </div>
     
                                 <span style="font-weight: 700; font-size: 22px; text-align: center; margin-top: 20px;">Welcome to the MWW on Demand Merch Maker!</span>
     
                                 <p style="font-weight: bold; font-family: Arial; font-size: 16px; text-align: center; margin-top: 20px;">
                                     Welcome ${firstName},
                                 </p>
     
                                 <p style="font-family: Arial; font-size: 14px; text-align: center; margin-top: 20px;">
                                 Thanks for signing up! To complete your account setup, please go to<br/><br/>
                                     <a style="color: blue;" href="${link}" target="_blank">
                                      ${link} > My Profile
                                     </a><br/>
                                 </p>
                             
                             </div>
     
                         </body>
                         </html>
     
                 `
                let emailResponse = await helpers.sendEmailService(to, subject, body, attachments)
                console.log(emailResponse, "emailResponseregister")
                return helpers.showResponse(true, ResponseMessages?.users?.register_success, data, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 200);
        } catch (err) {
            console.log("in catch err", err)
            return helpers.showResponse(false, ResponseMessages?.users?.register_error, err, null, 200);
        }

    },
    login: async (data) => {
        try {
            let { isLoginFromShopify, password, userName } = data
            let queryObject = { email: userName }
            let result = await getSingleData(Users, queryObject, '');
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.account_not_exist, null, null, 401);
            }
            let userData = result?.data
            if (userData?.password !== md5(password)) {
                return helpers.showResponse(false, ResponseMessages?.users?.invalid_credentials, null, null, 401);
            }
            if (userData?.status == 0) {
                return helpers.showResponse(false, ResponseMessages?.users?.account_disabled, null, null, 403);
            }
            // let device_info = userData?.device_info
            let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
            console.log(userData._id, 'userData._id')
            let access_token = jwt.sign({ user_type: "user", type: "access", _id: userData._id }, API_SECRET, {
                expiresIn: consts.ACCESS_EXPIRY
            });
            // let refresh_token = jwt.sign({ user_type: "user", type: "refresh", _id: userData._id }, API_SECRET, {
            //     expiresIn: consts.REFRESH_EXPIRY
            // });

            delete userData._doc.password
            console.log(userData, "userdataa")
            userData = { ...userData._doc, token: access_token }
            let editObj = {
                updatedOn: helpers.getCurrentDate()
            }
            let updateResponse = await updateData(Users, editObj, ObjectId(userData?._id))
            if (updateResponse.status) {
                console.log(userData, "userDatauserData")
                return helpers.showResponse(true, ResponseMessages?.users?.login_success, userData, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages?.users?.login_error, null, null, 200);
        } catch (err) {
            console.log("in login catch err", err)
            return helpers.showResponse(false, ResponseMessages?.users?.login_error, null, null, 200);
        }
    },
    logout: async (data, user_id) => {
        let queryObject = { _id: user_id }
        let result = await getSingleData(Users, queryObject, 'traceId');
        if (!result.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 200);
        }
        let userData = result?.data
        console.log(userData, "userData")
        return helpers.showResponse(true, ResponseMessages?.users?.logout_success, userData, null, 200);
    },


    forgotPassword: async (data) => {
        let { email } = data;
        try {
            let emailExistanceResponse = await UserUtils.checkEmailExistance(email)
            if (emailExistanceResponse?.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.invalid_email, null, null, 401);
            }
            let userData = emailExistanceResponse?.data

            let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
            let token = jwt.sign({ user_type: "user", type: "access", _id: userData?._id }, API_SECRET, {
                expiresIn: consts.ACCESS_EXPIRY
            });

            let link = `${consts.FRONTEND_URL}/resetPassword?resetPasswordToken=${token}&&emailId=${email}`
            let to = email
            let subject = `Reset Your Password For MWW On Demand`
            const logoPath = path.join(__dirname, '../views', 'logo.png');
            let attachments = [{
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@mwwLogo'
            }]

            let body = `
            <!DOCTYPE html>
                    <html>
                    <head>
                    </head>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">

                            <div style="text-align: center; padding: 10px;">
                                <img src="cid:unique@mwwLogo" alt="logo" style="max-height: 75px;" />
                            </div>

                            <span style="font-weight: 700; font-size: 22px; text-align: center; margin-top: 20px;">Reset Your Password For MWW On Demand</span>

                            <p style="font-weight: bold; font-family: Arial; font-size: 16px; text-align: center; margin-top: 20px;">
                                Welcome ${userData?.firstName},
                            </p>

                            <p style="font-family: Arial; font-size: 14px; text-align: center; margin-top: 20px;">
                                Need a new password for MWW On Demand? No problem!<br/><br/>
                                <a href="${link}" target="_blank">
                                    <button style="padding: 10px 22px; border-radius: 45px; background: #3630a3; color: white; font-weight: 400; font-family: Arial; font-size: 14px; text-decoration: none; display: inline-block;">Reset Your Password</button>
                                </a><br/>
                            </p>
                        
                        </div>

                    </body>
                    </html>

            `

            let emailResponse = await helpers.sendEmailService(to, subject, body, attachments)
            console.log(emailResponse, "emailResponse")
            if (emailResponse?.status) {
                return helpers.showResponse(true, ResponseMessages.users.verification_email_sent, true, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages?.users?.verification_email_error, null, null, 200);
        } catch (err) {
            console.log("in catch err", err)
            return helpers.showResponse(false, ResponseMessages?.users?.verification_email_error, err, null, 200);
        }
    },

    resetPassword: async (data) => {
        let { emailId, resetPasswordToken, newPassword } = data;
        let queryObject = {
            email: emailId
        }
        let response = await getSingleData(Users, queryObject, '')
        if (!response?.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_email, null, null, 200);
        }
        let userData = response?.data
        let verifyResponse = await middleware.verifyToken(resetPasswordToken)

        if (!verifyResponse?.status) {
            return verifyResponse
        }
        editObj = {
            password: md5(newPassword),
            updatedOn: helpers.getCurrentDate()
        }
        let result = await updateData(Users, editObj, ObjectId(userData?._id))
        if (!result?.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.password_reset_error, null, null, 200);
        }
        return helpers.showResponse(true, ResponseMessages?.users?.password_reset_success, null, null, 200);
    },

    changePasswordWithOld: async (data, user_id) => {
        let { oldPassword, newPassword ,userId} = data;
        let result = await getSingleData(Users, { password: { $eq: md5(oldPassword) }, _id: ObjectId(user_id) });
        if (!result.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_old_password, null, null, 200);
        }
        let updatedData = {
            password: md5(newPassword),
            updatedOn: helpers.getCurrentDate()
        }
        let response = await updateByQuery(Users, updatedData, { password: { $eq: md5(oldPassword) }, _id: ObjectId(user_id) });
        if (response.status) {
            return helpers.showResponse(true, ResponseMessages.users.password_change_successfull, null, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages.users.password_change_failed, null, null, 200);
    },


    // // with token 
    getUserDetail: async (data) => {
        let { user_id, _id } = data
        console.log(_id)
        let result = await Users.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(user_id), status: 1 } },  // Match the specific user by _id and status

            {
                $lookup: {
                    from: "userProfile",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "userProfileData"
                }
            },
            {
                $unwind: "$userProfgit ileData"
            },
            {
                $addFields: {
                    fullName: {
                        $concat: ['$firstName', ' ', '$lastName']
                    }, // Include the 'userProfileData' field
                    ncResaleInfo: {
                        isExemptionEligible: "$userProfileData.billingAddress.isExemptionEligible",
                        ncResaleCertificate: "$userProfileData.billingAddress.ncResaleCertificate"
                    },
                    userProfileData: "$userProfileData", // Include the 'userProfileData' field
                }
            },
            {
                $unset: "password" // Exclude the 'password' field
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: ["$$ROOT", "$userProfileData"] } }
            },
            {
                $unset: "userProfileData" // Exclude the 'password' field
            },

        ])

        console.log(result, "resulttt")

        if (!result) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 200);
        }

        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, result.length > 0 ? result[0] : {}, null, 200);
    },


    //?????????
    updateUser: async (data, user_id) => {
        if ("userName" in data && data.userName !== "") {
            let checkEmailExistance = await UserUtils.checkEmailExistance(data.email, user_id)
            if (!checkEmailExistance.status) {
                return {
                    ...checkEmailExistance,
                    data: null
                }
            }
        }

        // if ("access_token" in data) {
        //     return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
        // }
        // if ("refresh_token" in data) {
        //     return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
        // }
        data.updatedOn = helpers.getCurrentDate();

        let result = await updateData(Users, data, user_id)
        if (result) {
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result ? result : {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 200);
    },
    updateUserBasicDetails: async (data, user_id) => {
        const { userGuid } = data

        let queryObject = { _id: user_id, guid: userGuid }

        let checkUser = await getSingleData(Users, queryObject, '');
        console.log(checkUser, "checkUser checkUserExistance")
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 401);
        }

        data.updatedOn = helpers.getCurrentDate();

        let result = await updateData(Users, data, user_id)
        console.log(result, "resultUpdate")
        if (result) {
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result ? result : {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 200);
    },
    updateShippingDetails: async (data, user_id) => {
        const { userGuid } = data

        let queryObject = { _id: user_id, guid: userGuid }

        let checkUser = await getSingleData(Users, queryObject, '');
        console.log(checkUser, "checkUser")
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 401);
        }

        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(UserProfile, data, { user_id })

        console.log(result, "resultUpdate")
        if (result.status) {
            let updateRes = await updateSingleData(UserProfile, { 'completionStaus.shippingInfo': true }, { user_id })
            console.log(updateRes, "updateRes")
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result ? result : {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 200);
    },
    updateBillingAddress: async (data, user_id) => {
        const { userGuid } = data

        let queryObject = { _id: user_id, guid: userGuid }

        let checkUser = await getSingleData(Users, queryObject, '');
        console.log(checkUser, "checkUser")
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 401);
        }

        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(UserProfile, data, { user_id })

        console.log(result, "resultUpdate")
        if (result.status) {
            await updateSingleData(UserProfile, { 'completionStaus.billingInfo': true }, { user_id })
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result ? result : {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 200);
    },
    updatePaymentDetails: async (data, user_id) => {
        const { userGuid } = data

        let queryObject = { _id: user_id, guid: userGuid }

        let checkUser = await getSingleData(Users, queryObject, '');
        console.log(checkUser, "checkUser")
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 401);
        }

        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(UserProfile, data, { user_id })

        console.log(result, "resultUpdate")
        if (result.status) {
            await updateSingleData(UserProfile, { 'completionStaus.paymentInfo': true }, { user_id })
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result ? result : {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 200);
    },

}

module.exports = {
    ...UserUtils
}