require('../db_functions');
let Users = require('../models/Users');
let UserProfile = require('../models/UserProfile')
let ObjectId = require('mongodb').ObjectID;
let jwt = require('jsonwebtoken');
let helpers = require('../services/helper');
let moment = require('moment')
const md5 = require('md5');
const path = require('path')
const ResponseMessages = require('../constants/ResponseMessages');
const consts = require("../constants/const");
const { default: mongoose } = require('mongoose');
// const Question = require('../models/Question');
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
    // checkPhoneExistance: async (phone, user_id = null) => {
    //     let queryObject = { phone, status: { $ne: 2 } }
    //     if (user_id) {
    //         queryObject = { phone, _id: { $ne: ObjectId(user_id) }, status: { $ne: 2 } }
    //     }
    //     let result = await getSingleData(Users, queryObject, '');
    //     if (result?.status) {
    //         return helpers.showResponse(false, ResponseMessages.users.phone_already, result?.data, null, 200);
    //     }
    //     return helpers.showResponse(true, ResponseMessages?.users?.valid_phone, null, null, 200);
    // },
    // checkUsernameExistance: async (username, user_id = null) => {
    //     let queryObject = { username, status: { $ne: 2 } }
    //     if (user_id) {
    //         queryObject = { username, _id: { $ne: ObjectId(user_id) }, status: { $ne: 2 } }
    //     }
    //     let result = await getSingleData(Users, queryObject, '');
    //     if (result?.status) {
    //         return helpers.showResponse(false, ResponseMessages.users.username_already, null, null, 200);
    //     }
    //     return helpers.showResponse(true, ResponseMessages?.users?.valid_username, null, null, 200);
    // },
    // suggestUsername: async (username) => {
    //     let usernamesArray = []
    //     let usernamesList = []
    //     let queryObject = { status: { $ne: 2 } }
    //     let result = await getDataArray(Users, queryObject, 'username');
    //     if (result?.status) {
    //         usernamesArray = result?.data
    //         usernamesList = helpers.generateUsernames(username, 3, usernamesArray)
    //     } else {
    //         usernamesList = helpers.generateUsernames(username, 3)
    //     }
    //     return helpers.showResponse(true, ResponseMessages?.users?.username_suggestions, usernamesList, null, 200);
    // },
    // sendRegistrationCode: async (data) => {
    //     let { email, phone, input_source } = data;
    //     let otp = helpers.randomStr(4, "901234567234567123456712345671234567")
    //     if (input_source == "email") {
    //         try {
    //             let emailExistanceResponse = await UserUtils.checkEmailExistance(email)
    //             if (!emailExistanceResponse?.status) {
    //                 delete emailExistanceResponse.data
    //                 return emailExistanceResponse;
    //             }
    //             let to = email
    //             let subject = `Please verify your email`
    //             let attachments = [{
    //                 filename: 'logo.png',
    //                 path: "https://d3l2k2pgfexan.cloudfront.net/common/logo.png",
    //                 cid: 'unique@mwwLogo'
    //             }]
    //             let body = `
    //                 <div style="width:100%; max-width:600px">
    //                     <div style="width:100%; text-align:center; padding:10px;">
    //                         <img src="cid:unique@mwwLogo" alt="logo" style="max-height:75px" />
    //                     </div>
    //                     <p style="font-weight: bold; font-family: Arial; font-size: 18px">
    //                         Welcome Guest!!!
    //                     </p>
    //                     <p>
    //                         First off, we’re so excited to have you as part of our team! Below is your email verification code to get 
    //                         verified your email with Mww.
    //                     </p>
    //                     <p style="font-weight: bold; text-align:center">
    //                         Use below mentioned 4 Digit Code to verify your email address<br />
    //                     </p>
    //                     <p style="font-size:30px; text-align:center"> ${otp} </p>
    //                     <p style="font-family: Arial; font-size: 13px;">
    //                         If you have any questions about using our application and need help, please refer to the <br />
    //                         Frequently Asked Questions section within the application.
    //                     </p>
    //                     <p style="margin-top:40px">
    //                         We’re looking forward to being there every step of the way on your journey.
    //                     </p>
    //                     <p>
    //                         Best,<br />
    //                         Mww
    //                     </p>
    //                 </div>
    //             `
    //             let emailResponse = await helpers.sendEmailService(to, subject, body, attachments)
    //             if (emailResponse?.status) {
    //                 return helpers.showResponse(true, ResponseMessages.users.verification_email_sent, { otp }, null, 200);
    //             }
    //             return helpers.showResponse(false, ResponseMessages?.users?.verification_email_error, null, null, 200);
    //         } catch (err) {
    //             console.log("in catch err", err)
    //             return helpers.showResponse(false, ResponseMessages?.users?.verification_email_error, err, null, 200);
    //         }
    //     } else if (input_source == "phone") {
    //         if ("country_code" in data && data.country_code != "") {
    //             // send code through SMS 
    //             try {
    //                 let phoneExistanceResponse = await UserUtils.checkPhoneExistance(phone)
    //                 if (!phoneExistanceResponse?.status) {
    //                     return phoneExistanceResponse;
    //                 }
    //                 let phone_number = data.country_code + phone
    //                 let message = `Your verification code for Mww is : ${otp}`
    //                 let smsResponse = await helpers.sendSMSService(phone_number, message)
    //                 if (smsResponse?.status) {
    //                     return helpers.showResponse(true, ResponseMessages.users.verification_sms_sent, { otp }, null, 200);
    //                 }
    //                 return helpers.showResponse(false, ResponseMessages.users.verification_sms_error, null, null, 200);
    //             } catch (err) {
    //                 console.log("in catch err", err)
    //                 return helpers.showResponse(false, ResponseMessages?.users?.verification_sms_error, err, null, 200);
    //             }
    //         }
    //         return helpers.showResponse(false, ResponseMessages?.users?.missing_country_code, null, null, 200);
    //     } else {
    //         return helpers.showResponse(false, ResponseMessages?.users?.invalid_input_source, null, null, 200);
    //     }
    // },
    register: async (data) => {
        try {
            let { firstName, lastName, email, password } = data;

            let emailExistanceResponse = await UserUtils.checkEmailExistance(email)
            console.log(emailExistanceResponse, "emailExistanceResponse")
            if (!emailExistanceResponse?.status) {
                // if email already and check for password
                // let userData = emailExistanceResponse?.data;
                // if (userData?.password != "") {
                //     delete emailExistanceResponse.data
                //     return emailExistanceResponse
                // }
                // // if password empty and update user ????
                // let editObj = {
                //     // profile_pic,
                //     password: md5(password),
                //     updated_on: moment().unix()
                // }
                // let result = await updateData(Users, editObj, ObjectId(userData?._id));

                // if (result?.status) {
                //     userData = result?.data
                //     let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
                //     let access_token = jwt.sign({ user_type: "user", type: "access" }, API_SECRET, {
                //         expiresIn: consts.ACCESS_EXPIRY
                //     });
                //     let refresh_token = jwt.sign({ user_type: "user", type: "refresh" }, API_SECRET, {
                //         expiresIn: consts.REFRESH_EXPIRY
                //     });

                //     let response = { access_token, refresh_token, _id: userData?._id };

                //     await updateData(Users, editObj, ObjectId(userData?._id))

                //     return helpers.showResponse(true, ResponseMessages?.users?.register_success, response, null, 200);
                // }
                // const usersCount = await getCount(Users,{userType:3})
                // const idd = helpers.generateIDs(usersCount?.data)
                //   console.log(idd,"iddd")
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
                    return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 402);
                }

                console.log(resultProfile,"resultProfile")
                // let API_SECRET = helpers.getParameterFromAWS({ name: "API_SECRET" })
                // let access_token = jwt.sign({ user_type: "user", type: "access" }, API_SECRET, {
                //     expiresIn: consts.ACCESS_EXPIRY
                // });
                // let refresh_token = jwt.sign({ user_type: "user", type: "refresh" }, API_SECRET, {
                //     expiresIn: consts.REFRESH_EXPIRY
                // });
                // let data = { access_token, refresh_token, _id: result?.data?._id };
                // let device_info = result?.data?.device_info

                // let editObj = {
                //     device_info,
                //     updated_on: moment().unix()
                // }
                // await updateData(Users, editObj, ObjectId(result?.data?._id))
                 //------------
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
                 console.log(emailResponse,"emailResponseregister")


                //-----------
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
            //  { $or: [{ email: userName, password: md5(password) }] }
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

            // let responseData = { access_token, refresh_token, _id: userData?._id };
            // let dIndex = device_info.findIndex((it) => it.device_id == device_id)
            // if (dIndex < 0) {
            //     device_info.push({ fcm_token, device_id, os, access_token, refresh_token })
            // } else {
            //     device_info[dIndex] = {
            //         ...device_info,
            //         fcm_token,
            //         os,
            //         device_id,
            //         access_token,
            //         refresh_token
            //     }
            // }
            let editObj = {
                // device_info,
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
        // let { access_token, device_id } = data;
        let queryObject = { _id: user_id }
        let result = await getSingleData(Users, queryObject, 'traceId');
        if (!result.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 200);
        }
        let userData = result?.data
        console.log(userData, "userData")
        // let device_info = userData?.device_info
        // let dIndex = device_info.findIndex((it) => it.device_id == device_id)
        // if (dIndex >= 0) {
        //     device_info.splice(dIndex, 1)
        // }
        // let editObj = {
        //     device_info,
        //     updated_on: moment().unix()
        // }
        // await updateData(Users, editObj, ObjectId(result?.data?._id))
        return helpers.showResponse(true, ResponseMessages?.users?.logout_success, userData, null, 200);
    },

    // socialLogin: async (data) => {
    //     try {
    //         let { login_source, device_id, fcm_token, os } = data;
    //         let where
    //         if (login_source == "facebook") {
    //             let { fb_uid } = data
    //             where = { fb_uid, status: { $ne: 2 } }
    //         } else if (login_source == "google") {
    //             let { google_id } = data
    //             where = { google_id, status: { $ne: 2 } }
    //         } else if (login_source == "apple") {
    //             let { auth_token } = data
    //             where = { auth_token, status: { $ne: 2 } }
    //         }
    //         let userCheck = await getSingleData(Users, where, '');
    //         if (userCheck.status) {
    //             // yes token exist
    //             let editObj = {
    //                 updated_on: moment().unix()
    //             }
    //             let userData = userCheck?.data
    //             if ("email" in data && data.email != "") {
    //                 editObj.email = data.email
    //             }
    //             if ("profile_pic" in data && data.profile_pic != "") {
    //                 editObj.profile_pic = data.profile_pic
    //             }
    //             let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
    //             let access_token = jwt.sign({ user_type: "user", type: "access" }, API_SECRET, {
    //                 expiresIn: consts.ACCESS_EXPIRY
    //             });
    //             let refresh_token = jwt.sign({ user_type: "user", type: "refresh" }, API_SECRET, {
    //                 expiresIn: consts.REFRESH_EXPIRY
    //             });
    //             let responseData = { access_token, refresh_token, _id: userData?._id };
    //             let device_info = userData?.device_info
    //             let dIndex = device_info.findIndex((it) => it.device_id == device_id)
    //             if (dIndex < 0) {
    //                 device_info.push({ fcm_token, device_id, os, access_token, refresh_token })
    //             } else {
    //                 device_info[dIndex] = {
    //                     ...device_info,
    //                     fcm_token,
    //                     os,
    //                     device_id,
    //                     access_token,
    //                     refresh_token
    //                 }
    //             }
    //             editObj.device_info = device_info
    //             let response = await updateData(Users, editObj, ObjectId(userData?._id));
    //             if (response.status) {
    //                 return helpers.showResponse(true, ResponseMessages?.users?.register_success, responseData, null, 200);
    //             }
    //             return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 200);
    //         } else {
    //             if ("email" in data && data.email != "") {
    //                 // now check email
    //                 let { email } = data
    //                 let emailCheck = await getSingleData(Users, { email, status: { $ne: 2 } }, '');
    //                 if (emailCheck?.status) {
    //                     // email exist
    //                     let userData = emailCheck?.data
    //                     let editObj = {
    //                         updated_on: moment().unix()
    //                     }
    //                     if ("profile_pic" in data && data.profile_pic != "") {
    //                         editObj.profile_pic = data.profile_pic
    //                     }
    //                     if (login_source == "facebook") {
    //                         editObj.fb_uid = data.fb_uid
    //                     } else if (login_source == "google") {
    //                         editObj.google_id = data.google_id
    //                     } else if (login_source == "apple") {
    //                         editObj.auth_token = data.auth_token
    //                     }
    //                     let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
    //                     let access_token = jwt.sign({ user_type: "user", type: "access" }, API_SECRET, {
    //                         expiresIn: consts.ACCESS_EXPIRY
    //                     });
    //                     let refresh_token = jwt.sign({ user_type: "user", type: "refresh" }, API_SECRET, {
    //                         expiresIn: consts.REFRESH_EXPIRY
    //                     });
    //                     let responseData = { access_token, refresh_token, _id: userData?._id };
    //                     let device_info = userData?.device_info
    //                     console.log("device_info", device_info)
    //                     let dIndex = device_info.findIndex((it) => it.device_id == device_id)
    //                     if (dIndex < 0) {
    //                         device_info.push({ fcm_token, device_id, os, access_token, refresh_token })
    //                     } else {
    //                         device_info[dIndex] = {
    //                             ...device_info,
    //                             fcm_token,
    //                             os,
    //                             device_id,
    //                             access_token,
    //                             refresh_token
    //                         }
    //                     }
    //                     editObj.device_info = device_info
    //                     let response = await updateData(Users, editObj, ObjectId(userData?._id));
    //                     if (response.status) {
    //                         return helpers.showResponse(true, ResponseMessages?.users?.register_success, responseData, null, 200);
    //                     }
    //                     return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 200);
    //                 }
    //             }
    //             // register as a new User
    //             let newObj = {
    //                 device_info: [{
    //                     device_id,
    //                     os,
    //                     fcm_token
    //                 }],
    //                 login_source,
    //                 created_on: moment().unix()
    //             };
    //             if ("email" in data && data.email != "") {
    //                 newObj.email = data.email
    //             }
    //             if ("profile_pic" in data && data.profile_pic != "") {
    //                 newObj.profile_pic = data.profile_pic
    //             }
    //             if ("username" in data && data.username != "") {
    //                 newObj.username = data.username
    //             }
    //             if (login_source == "facebook") {
    //                 newObj.fb_uid = data.fb_uid
    //             } else if (login_source == "google") {
    //                 newObj.google_id = data.google_id
    //             } else if (login_source == "apple") {
    //                 newObj.auth_token = data.auth_token
    //             }
    //             let authRef = new Users(newObj)
    //             let result = await postData(authRef);
    //             if (result.status) {
    //                 let userData = result?.data
    //                 let device_info = userData?.device_info
    //                 let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
    //                 let access_token = jwt.sign({ user_type: "user", type: "access" }, API_SECRET, {
    //                     expiresIn: consts.ACCESS_EXPIRY
    //                 });
    //                 let refresh_token = jwt.sign({ user_type: "user", type: "refresh" }, API_SECRET, {
    //                     expiresIn: consts.REFRESH_EXPIRY
    //                 });
    //                 let responseData = { access_token, refresh_token, _id: userData?._id };
    //                 device_info = device_info?.map((di) => {
    //                     if (di.device_id == device_id) {
    //                         return {
    //                             ...di._doc,
    //                             access_token,
    //                             refresh_token
    //                         }
    //                     } else {
    //                         return di
    //                     }
    //                 })
    //                 let editObj = {
    //                     device_info,
    //                     updated_on: moment().unix()
    //                 }
    //                 await updateData(Users, editObj, ObjectId(result?.data?._id))
    //                 return helpers.showResponse(true, ResponseMessages?.users?.register_success, responseData, null, 200);
    //             }
    //             return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 200);
    //         }
    //     } catch (err) {
    //         console.log("in catch social login error", err)
    //         return helpers.showResponse(false, ResponseMessages?.users?.register_error, err, null, 200);
    //     }
    // },
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
            // console.log(userData,"userDatauserData")
            // let editObj = {
            //     token,
            //     updated_on: moment().unix()
            // }
            // let response = await updateData(Users, editObj, ObjectId(userData?._id))
            // if (!response?.status) {
            //     return helpers.showResponse(false, ResponseMessages?.users?.invalid_email, null, null, 401);
            // }
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
    // getBadgeCondition: async (user_id) => {
    //     return new Promise(async (resolve, reject) => {

    //         let [userDetails, videos] = await Promise.all([
    //             await Users.aggregate([
    //                 { $match: { _id: mongoose.Types.ObjectId(user_id) } }, // Match the user by _id
    //                 {
    //                     $project: {
    //                         monthly_amount_added: 1,
    //                         monthly_views: 1,
    //                         user_verified_face: 1,
    //                         user_verified_answers: 1,
    //                         total_views: 1,
    //                         vvip: 1,
    //                         badge: 1,
    //                         level: 1
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'users',
    //                         pipeline: [
    //                             { $sort: { monthly_views: -1 } }, // Sort users by monthly_views in descending order
    //                             { $group: { _id: null, users: { $push: '$$ROOT' } } }, // Group all users into an array
    //                             { $match: { 'users._id': mongoose.Types.ObjectId(user_id) } }, // Match the user by _id
    //                             { $project: { rank: { $indexOfArray: ['$users._id', mongoose.Types.ObjectId(user_id)] } } } // Find the index of the user in the array
    //                         ],
    //                         as: 'rank'
    //                     }
    //                 },
    //                 { $unwind: { path: '$rank', preserveNullAndEmptyArrays: true } },
    //                 { $addFields: { rank: { $add: ['$rank.rank', 1] } } } // Add 1 to get the actual rank (since array indexes are zero-based)
    //             ]),
    //             Videos.find({ status: 1, user_id: mongoose.Types.ObjectId(user_id) }).count()
    //         ])

    //         const { user_verified_answers, user_verified_face, rank, total_views, badge, monthly_amount_added, level } = userDetails[0] || {}
    //         console.log(userDetails)
    //         let queryObject = {}
    //         if (user_verified_answers == 1 && user_verified_face == 1) {
    //             if (videos >= 50 && rank <= 50) {
    //                 queryObject.badge = 4 //blue tick
    //             }
    //             else if (videos >= 10 && total_views >= 5000) {
    //                 queryObject.badge = 3 //orange tick
    //             }
    //             else if (videos >= 6 && total_views >= 1000) {
    //                 queryObject.badge = 2 //white tick
    //             }
    //             else {
    //                 queryObject.badge = 1 //user verified
    //             }
    //             if (rank <= 50) {
    //                 queryObject['frames.popular_star.is_unlocked'] = 1
    //             }
    //             else if (rank >= 51 && rank <= 300) {
    //                 queryObject['frames.rising_star.is_unlocked'] = 1
    //             }
    //             console.log(queryObject)
    //             let result = await Users.updateOne({ _id: mongoose.Types.ObjectId(user_id) }, { $set: queryObject })
    //             if (result) {
    //                 resolve(null)
    //             }
    //         }
    //         else {
    //             resolve(null)
    //         }
    //     });
    // },

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
                    fullName:{
                        $concat:['$firstName' ,' ', '$lastName']
                    }, // Include the 'userProfileData' field
                    ncResaleInfo:{
                        isExemptionEligible:"$userProfileData.billingAddress.isExemptionEligible",
                        ncResaleCertificate:"$userProfileData.billingAddress.ncResaleCertificate"
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
    // markFrameActive: async (data) => {
    //     try {
    //         let { frame_name, user_id } = data
    //         let obj = {
    //             'frames.new_angel.is_active': 0,
    //             'frames.master_angel.is_active': 0,
    //             'frames.old_angel.is_active': 0,
    //             'frames.super_angel.is_active': 0,
    //             'frames.gift_hero.is_active': 0,
    //             'frames.super_gifter.is_active': 0,
    //             'frames.creative_gifter.is_active': 0,
    //             'frames.helpful_mentor.is_active': 0,
    //             'frames.gift_champion.is_active': 0,
    //             'frames.joy_spreader.is_active': 0,
    //             "frames.popular_star.is_active": 0,
    //             "frames.talented_start.is_active": 0,
    //             "frames.rising_star.is_active": 0

    //         }
    //         let frameNotNull = frame_name && frame_name != ""
    //         if (frameNotNull) {
    //             obj["frames." + frame_name + ".is_active"] = 1
    //         }
    //         console.log(frame_name, "frames", obj)
    //         let result = await Users.updateOne(frameNotNull ? { ["frames." + frame_name + ".is_unlocked"]: 1, _id: mongoose.Types.ObjectId(user_id) } : {
    //             _id: mongoose.Types.ObjectId(user_id)

    //         }, {
    //             $set: obj
    //         })
    //         if (result) {
    //             return helpers.showResponse(true, frameNotNull ? ResponseMessages?.users?.frame_active : ResponseMessages?.users?.frame_removed, null, null, 200);
    //         }
    //     } catch (error) {
    //         return helpers.showResponse(false, error?.message, null, null, 200);

    //     }
    // },
    // follow: async (data, _id) => {
    //     let { user_id, follow } = data
    //     console.log(user_id, "user_id_to_follow")
    //     console.log(_id, "user_id_autheticated")
    //     let followingId = ObjectId(user_id)
    //     let followerId = ObjectId(_id)
    //     const [follower, following] = await Promise.all([
    //         // Add follower to the user's followers list
    //         await Users.findByIdAndUpdate(followingId,
    //             follow == 1 ? { $addToSet: { followers: followerId } } : {
    //                 $pull: { followers: followerId },
    //             }),
    //         // Add following to the follower's following list

    //         await Users.findByIdAndUpdate(followerId, follow == 1 ? {
    //             $addToSet: { following: followingId },
    //         } : { $pull: { following: followingId } })
    //     ])
    //     if (follower && following) {
    //         follow == 1 && helpers.sendFcmNotificationTopic(user_id, { title: "Following", body: following.username + " started following you", type: "following", user: { _id: follower?._id } })

    //         return helpers.showResponse(true, follow == 1 ? ResponseMessages?.users?.following : ResponseMessages?.users?.unfollowing, null, null, 200);

    //     }
    //     return helpers.showResponse(false, ResponseMessages?.users?.error_following, null, null, 200);

    // },
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
        // if ("username" in data && data.username !== "") {
        //     let checkUsernameExistance = await UserUtils?.checkUsernameExistance(data?.username, user_id)
        //     if (!checkUsernameExistance.status) {
        //         return checkUsernameExistance
        //     }
        // }
        if ("access_token" in data) {
            return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
        }
        if ("refresh_token" in data) {
            return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
        }
        // if ("device_info" in data) {
        //     return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
        // }
        // if ("status" in data && data.status == 2) {
        //     let validator = helpers.validateParamsArray(['delete_reason'], data)
        //     if (!validator.status) {
        //         return helpers.showResponse(false, validator.message, null, null, 203);
        //     }
        // }
        // if ("bank_account" in data && data?.bank_account != "") {
        //     data.bank_account = data?.bank_account ? typeof data?.bank_account == 'string' ? JSON.parse(data?.bank_account) : data?.bank_account : {}
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

    // followerList: async (data) => {
    //     let { page, limit, _id, user_id } = data
    //     const pages = page // Specify the page number you want to retrieve
    //     const pageSize = Number(limit); // Specify the number of items per page

    //     const skipAmount = (pages - 1) * pageSize;
    //     let authenticatedUserId = _id
    //     let targetedUserId = user_id
    //     console.log(mongoose.Types.ObjectId(authenticatedUserId))

    //     let pipeline = []
    //     let match = {
    //         $match: {
    //             _id: ObjectId(targetedUserId)
    //         }
    //     }

    //     pipeline.push(match)
    //     let conditions = [
    //         {
    //             $lookup: {
    //                 from: "users",
    //                 localField: "followers",
    //                 foreignField: "_id",
    //                 as: "followers"
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 followers:
    //                     [
    //                         {
    //                             $map: {
    //                                 input: "$followers",
    //                                 in: {
    //                                     _id: "$$this._id",
    //                                     profile_pic: "$$this.profile_pic",
    //                                     username: "$$this.username",
    //                                     frames: "$$this.frames",
    //                                     badge: "$$this.badge",
    //                                     icon: "$$this.icon",
    //                                     level: "$$this.level",
    //                                     you_following_user: { $in: [mongoose.Types.ObjectId(authenticatedUserId), '$$this.followers'] },
    //                                     user_following_you: { $in: [mongoose.Types.ObjectId(authenticatedUserId), '$$this.following'] }
    //                                 }
    //                             }
    //                         }
    //                     ]

    //             },

    //         },

    //         {
    //             $unwind: "$followers"
    //         },

    //         {
    //             $project: {
    //                 followers: 1
    //             }
    //         },
    //         {
    //             $skip: skipAmount
    //         },
    //         {
    //             $limit: pageSize
    //         }
    //     ]
    //     pipeline.push(...conditions)
    //     let targetFollowers = await Users.aggregate(pipeline)
    //     if (targetFollowers[0]) {
    //         return helpers.showResponse(true, ResponseMessages?.users?.users_list, targetFollowers[0]?.followers, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.users?.no_users, null, null, 200);
    // },
    // followingList: async (data) => {
    //     let { page, limit, _id, user_id } = data
    //     const pages = page // Specify the page number you want to retrieve
    //     const pageSize = Number(limit); // Specify the number of items per page

    //     const skipAmount = (pages - 1) * pageSize;
    //     let authenticatedUserId = _id
    //     let targetedUserId = user_id

    //     let pipeline = []
    //     let match = {
    //         $match: {
    //             _id: mongoose.Types.ObjectId(targetedUserId)
    //         },

    //     }

    //     pipeline.push(match)
    //     let conditions = [
    //         {
    //             $lookup: {
    //                 from: "users",
    //                 localField: "following",
    //                 foreignField: "_id",
    //                 as: "following"
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 following:
    //                     [
    //                         {
    //                             $map: {
    //                                 input: "$following",
    //                                 in: {
    //                                     _id: "$$this._id",
    //                                     profile_pic: "$$this.profile_pic",
    //                                     username: "$$this.username",
    //                                     frames: "$$this.frames",
    //                                     badge: "$$this.badge",
    //                                     icon: "$$this.icon",
    //                                     level: "$$this.level",
    //                                     you_following_user: { $in: [mongoose.Types.ObjectId(authenticatedUserId), '$$this.followers'] },
    //                                     user_following_you: { $in: [mongoose.Types.ObjectId(authenticatedUserId), '$$this.following'] }
    //                                 }
    //                             }
    //                         }
    //                     ]

    //             },

    //         },

    //         {
    //             $unwind: "$following"
    //         },
    //         {
    //             $project: {
    //                 following: 1
    //             }
    //         },
    //         {
    //             $skip: skipAmount
    //         },
    //         {
    //             $limit: pageSize
    //         }
    //     ]
    //     pipeline.push(...conditions)

    //     console.log(pipeline)
    //     let targetfollowing = await Users.aggregate(pipeline)
    //     // console.log(targetfollowing)
    //     if (targetfollowing) {
    //         return helpers.showResponse(true, ResponseMessages?.users?.users_list, targetfollowing[0].following, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.users?.no_users, null, null, 200);

    // },

    // searchUser: async (data) => {
    //     const { keyword, user_id, page, limit } = data
    //     const pages = page // Specify the page number you want to retrieve
    //     const pageSize = Number(limit); // Specify the number of items per page
    //     const skipAmount = (pages - 1) * pageSize;
    //     const regex = new RegExp(keyword, 'i');
    //     const authenticatedUserId = user_id
    //     let pipeline = [
    //         {
    //             $match: { username: regex }
    //         }
    //     ]
    //     if (authenticatedUserId) {
    //         pipeline.push(...[
    //             {
    //                 $addFields: {
    //                     you_following_user: { $in: [mongoose.Types.ObjectId(authenticatedUserId), '$followers'] },
    //                     user_following_you: { $in: [mongoose.Types.ObjectId(authenticatedUserId), '$following'] }
    //                 }
    //             }])
    //     }
    //     pipeline.push({
    //         $project: {
    //             username: 1,
    //             profile_pic: 1,
    //             you_following_user: 1,
    //             user_following_you: 1,
    //             frames: 1,
    //             badge: 1,
    //             icon: 1,
    //             level: 1
    //         }
    //     },
    //         {
    //             $skip: skipAmount
    //         },
    //         {
    //             $limit: pageSize
    //         }
    //     )

    //     const users = await Users.aggregate(pipeline);

    //     if (users) {
    //         return helpers.showResponse(true, ResponseMessages?.users?.users_list, users, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.users?.no_users, null, null, 200);
    // },
    // getQuestions: async (data) => {
    //     try {
    //         let result = await Question.aggregate([
    //             { $match: { status: 1 } },    // Match questions with status 1
    //             { $sample: { size: 15 } }   // Randomly select specified number of questions
    //         ])
    //         if (result) {
    //             return helpers.showResponse(true, ResponseMessages?.users.questions, result, null, 200);

    //         }
    //         return helpers.showResponse(false, ResponseMessages?.users.no_questions, null, null, 200);
    //     } catch (error) {
    //         return helpers.showResponse(false, error.message, null, null, 200);

    //     }

    // },
    // getCategories: async (data) => {
    //     try {
    //         let result = await CreatorCategories.find({ status: 1 })
    //         if (result) {
    //             return helpers.showResponse(true, ResponseMessages?.users.categories_list, result, null, 200);
    //             result
    //         }
    //         return helpers.showResponse(false, ResponseMessages?.users.categories_list_not, null, null, 200);
    //     } catch (error) {
    //         return helpers.showResponse(false, error.message, null, null, 200);

    //     }

    // },
    // verifyUser: async (data) => {
    //     try {
    //         let { mode, user_id, status } = data
    //         if (status == undefined || status == null) {
    //             status = 1;
    //         }
    //         let result = null
    //         let response = null
    //         if (mode == 'user_verified_face') {
    //             [result, response] = await Promise.all([
    //                 Users.updateOne({ _id: mongoose.Types.ObjectId(user_id) }, { $set: { [mode]: status } }),
    //                 VerificationRequest.updateOne({ user_id: mongoose.Types.ObjectId(user_id) }, { $set: { approved: status } })
    //             ])
    //         }
    //         else {
    //             result = await Users.updateOne({ _id: mongoose.Types.ObjectId(user_id) }, { $set: { [mode]: status } })
    //         }
    //         if (result) {

    //             return helpers.showResponse(true, ResponseMessages.users.user_verified, null, null, 200);

    //         }
    //         return helpers.showResponse(true, ResponseMessages.common.server_error, null, null, 200);

    //     } catch (error) {
    //         return helpers.showResponse(false, error.message, null, null, 200);

    //     }
    // },
    // verifyUserInProgress: async (data) => {
    //     try {
    //         const { user_id, image } = data
    //         let refVerificationRequest = new VerificationRequest({
    //             image, user_id: mongoose.Types.ObjectId(user_id)
    //         })
    //         let [saved, result] = await Promise.all([
    //             refVerificationRequest.save(),
    //             Users.updateOne({ _id: mongoose.Types.ObjectId(user_id) }, { $set: { "user_verified_face": 3 } })
    //         ])
    //         if (result) {
    //             return helpers.showResponse(true, ResponseMessages.users.user_verified, null, null, 200);

    //         }
    //         return helpers.showResponse(true, ResponseMessages.common.server_error, null, null, 200);

    //     } catch (error) {
    //         return helpers.showResponse(false, error.message, null, null, 200);

    //     }
    // },
    // reportUser: async (data) => {
    //     try {
    //         const { video_id, user_id, description } = data
    //         let ref = new Reports({
    //             video_id, user_id, description
    //         })
    //         let result = await ref.save()
    //         if (result) {
    //             return helpers.showResponse(true, ResponseMessages.report.report, null, null, 200);

    //         }
    //         return helpers.showResponse(true, ResponseMessages.common.server_error, null, null, 200);

    //     } catch (error) {
    //         return helpers.showResponse(false, error.message, null, null, 200);

    //     }
    // },
    // // admin panel
    // getAllUsers: async (body) => {
    //     let queryObject = { status: { $ne: 2 } }
    //     const { limit, page } = body
    //     const pages = page // Specify the page number you want to retrieve
    //     const pageSize = Number(limit); // Specify the number of items per page

    //     const skipAmount = (pages - 1) * pageSize;
    //     let pipeline = [
    //         { $match: queryObject },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 let: { id: { $toObjectId: '$_id' } },
    //                 pipeline: [
    //                     { $sort: { monthly_views: -1 } }, // Sort users by monthly_views in descending order
    //                     { $group: { _id: null, users: { $push: '$$ROOT' } } }, // Group all users into an array
    //                     { $project: { rank: { $indexOfArray: ['$users._id', "$$id"] } } } // Find the index of the user in the array
    //                 ],
    //                 as: 'rank'
    //             }
    //         },
    //         { $unwind: { path: '$rank', preserveNullAndEmptyArrays: true } },
    //         { $addFields: { rank: { $add: ['$rank.rank', 1] } } },
    //         {
    //             $addFields: {
    //                 total_following: { $size: "$following" },
    //                 total_followers: { $size: "$followers" }
    //             }
    //         },
    //         { $project: { plans: 0, device_info: 0, followers: 0, following: 0, password: 0 } },
    //         { $sort: { rank: 1 } },

    //     ]
    //     let totalCount = (await Users.aggregate([...pipeline, {
    //         $group: {
    //             _id: null,
    //             totalCount: { $sum: 1 }
    //         }
    //     }]))[0]?.totalCount
    //     pipeline.push(...[{
    //         $skip: skipAmount
    //     },
    //     {
    //         $limit: pageSize
    //     }])
    //     let response = await Users.aggregate(pipeline)

    //     if (response.length > 0) {
    //         return helpers.showResponse(true, ResponseMessages?.users?.users_list, response, { totalCount }, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.users?.no_users, null, null, 200);
    // },
    // updateUserAdmin: async (data, user_id) => {
    //     if ("email" in data && data.email !== "") {
    //         let checkEmailExistance = await UserUtils.checkEmailExistance(data.email, user_id)
    //         if (!checkEmailExistance.status) {
    //             return {
    //                 ...checkEmailExistance,
    //                 data: null
    //             }
    //         }
    //     }
    //     if ("username" in data && data.username !== "") {
    //         let checkUsernameExistance = await UserUtils?.checkUsernameExistance(data?.username, user_id)
    //         if (!checkUsernameExistance.status) {
    //             return checkUsernameExistance
    //         }
    //     }
    //     if ("access_token" in data) {
    //         return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
    //     }
    //     if ("refresh_token" in data) {
    //         return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
    //     }
    //     if ("device_info" in data) {
    //         return helpers.showResponse(false, ResponseMessages?.users?.beyond_the_limit, updateResponse?.data, null, 200);
    //     }
    //     if ("bank_account" in data && data?.bank_account != "") {
    //         data.bank_account = data?.bank_account ? typeof data?.bank_account == 'string' ? JSON.parse(data?.bank_account) : data?.bank_account : {}
    //     }
    //     data.updated_on = moment().unix();

    //     let result = await Users.aggregate([
    //         { $match: { _id: mongoose.Types.ObjectId(user_id), status: 1 } },  // Match the specific user by _id and status
    //         { $set: data },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 let: { id: { $toObjectId: '$_id' } },
    //                 pipeline: [
    //                     { $sort: { monthly_views: -1 } }, // Sort users by monthly_views in descending order
    //                     { $group: { _id: null, users: { $push: '$$ROOT' } } }, // Group all users into an array
    //                     { $project: { rank: { $indexOfArray: ['$users._id', "$$id"] } } } // Find the index of the user in the array
    //                 ],
    //                 as: 'rank'
    //             }
    //         },
    //         { $unwind: { path: '$rank', preserveNullAndEmptyArrays: true } },
    //         { $addFields: { rank: { $add: ['$rank.rank', 1] } } },
    //         {
    //             $lookup: {
    //                 from: "videos",
    //                 localField: "_id",
    //                 foreignField: "user_id",
    //                 as: "videos"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //                 userDetails: {
    //                     $mergeObjects: [
    //                         "$$ROOT",
    //                         {
    //                             total_videos: { $size: "$videos" },
    //                             total_likes: { $sum: { $map: { input: "$videos.likes", as: "likes", in: { $size: "$$likes" } } } }
    //                             , total_following: { $size: "$following" },
    //                             total_followers: { $size: "$followers" }
    //                         }
    //                     ]
    //                 }
    //             }
    //         },
    //         {
    //             $project: {
    //                 "userDetails.videos": 0,
    //                 "userDetails.password": 0,
    //                 "userDetails.access_token": 0,
    //                 "userDetails.device_info": 0,
    //                 "userDetails.plans": 0,
    //                 "userDetails.followers": 0,
    //                 "userDetails.following": 0

    //             }
    //         },
    //         { $replaceRoot: { newRoot: "$userDetails" } }
    //     ])
    //     if (result.length > 0) {
    //         return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result.length > 0 ? result[0] : {}, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 200);
    // },
    // markFrameUnlocked: async (data) => {
    //     try {
    //         let { frame_name, user_id } = data
    //         let frameNotNull = frame_name && frame_name != ""
    //         let obj = {}
    //         if (frameNotNull) {
    //             obj["frames." + frame_name + ".is_unlocked"] = 1
    //         }
    //         let result = await Users.updateOne({
    //             _id: mongoose.Types.ObjectId(user_id)

    //         }, {
    //             $set: obj
    //         })
    //         if (result) {
    //             return helpers.showResponse(true, ResponseMessages?.users?.frame_unlocked, null, null, 200);
    //         }
    //     } catch (error) {
    //         return helpers.showResponse(false, error?.message, null, null, 200);

    //     }
    // },
    // listReports: async (data) => {
    //     try {
    //         const { page, limit } = data
    //         const pages = page // Specify the page number you want to retrieve
    //         const pageSize = Number(limit); // Specify the number of items per page
    //         const skipAmount = (pages - 1) * pageSize;
    //         let pipeline = [
    //             {
    //                 $match: {
    //                     status: 1,
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "user_id",
    //                     foreignField: "_id",
    //                     as: "user_id"
    //                 }
    //             },
    //             { $unwind: { path: '$user_id', preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "videos",
    //                     localField: "video_id",
    //                     foreignField: "_id",
    //                     as: "video_id"
    //                 }
    //             },
    //             { $unwind: { path: '$video_id', preserveNullAndEmptyArrays: true } },
    //             {
    //                 $project: {
    //                     "status": 1,
    //                     "description": 1,
    //                     "user_id.profile_pic": 1,
    //                     "user_id.username": 1,
    //                     "user_id.email": 1,
    //                     "video_id.title": 1,
    //                     "video_id.video_link": 1,
    //                     "video_id.title": 1,
    //                     "video_id.thumb": 1,
    //                     "video_id.desc": 1,
    //                     "video_id.hash_tags": 1,
    //                     "video_id.user_id": 1

    //                 }
    //             },

    //         ]
    //         let totalCount = (await Reports.aggregate([...pipeline, {
    //             $group: {
    //                 _id: null,
    //                 totalCount: { $sum: 1 }
    //             }
    //         }]))[0]?.totalCount
    //         pipeline.push(...[{
    //             $skip: skipAmount
    //         },
    //         {
    //             $limit: pageSize
    //         }])
    //         let result = await Reports.aggregate(pipeline)
    //         return helpers.showResponse(true, ResponseMessages?.report?.report_list, result, { totalCount }, 200);

    //     } catch (error) {
    //         return helpers.showResponse(false, error?.message, null, null, 200);

    //     }
    // },

}

module.exports = {
    ...UserUtils
}