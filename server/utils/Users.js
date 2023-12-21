require('../db_functions');
let Users = require('../models/Users');
let UserProfile = require('../models/UserProfile')
let ObjectId = require('mongodb').ObjectId;
let jwt = require('jsonwebtoken');
let helpers = require('../services/helper');
const md5 = require('md5');
const path = require('path')
const ResponseMessages = require('../constants/ResponseMessages');
const consts = require("../constants/const");
const { default: mongoose } = require('mongoose');
const { randomUUID } = require('crypto')
const middleware = require('../middleware/authentication');
const Orders = require('../models/Orders')
const Material = require("../models/Material")
const axios = require("axios");
const { urlencoded } = require('express');
const { Parser } = require('json2csv')
const ejs = require('ejs');

const UserUtils = {

    checkEmailExistance: async (email, user_id = null) => {
        let queryObject = { email, status: { $ne: 2 } }
        if (user_id) {
            queryObject = { email, _id: { $ne: new ObjectId(user_id) }, status: { $ne: 2 } }
        }
        let result = await getSingleData(Users, queryObject, '');
        if (result?.status) {
            return helpers.showResponse(false, ResponseMessages.users.email_already, result?.data, null, 403);
        }
        return helpers.showResponse(true, ResponseMessages?.users?.valid_email, null, null, 200);
    },
    checkUserExistance: async (user_id, guid = null) => {
        let queryObject = { _id: user_id }
        if (guid) {
            queryObject = { user_id, guid }
        }
        let result = await getSingleData(Users, queryObject, '');
        if (result?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, result?.data, null, 200);
        }
        return helpers.showResponse(true, ResponseMessages?.users?.valid_username, null, null, 200);
    },
    register: async (data, profileImg) => {
        try {
            let { firstName, lastName, email, password, phoneNumber, } = data;

            console.log(data, "dataaa");
            let emailExistanceResponse = await UserUtils.checkEmailExistance(email)
            if (!emailExistanceResponse?.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.email_already, null, null, 403);
            }
            // let count = await getCount(Users, { userType: 3 })
            // let idGenerated = helpers.generateIDs(count?.data)
            // console.log(idGenerated, "id generateddd");
            let newObj = {
                firstName,
                lastName,
                email: email,
                userName: email,
                phoneNumber,
                // id: idGenerated.idNumber,
                // guid: randomUUID(),
                // customerId: idGenerated.customerID,
                // customerGuid: randomUUID(),
                password: md5(password),
                createdOn: helpers.getCurrentDate()
            }


            if (profileImg) {
                //upload image to aws s3 bucket
                const s3Upload = await helpers.uploadFileToS3([profileImg])
                if (!s3Upload.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
                }

                newObj.profileImagePath = s3Upload?.data[0]
            }
            const usersCount = await getCount(Users, { userType: 3 })

            if (!usersCount.status) {
                return helpers.showResponse(false, ResponseMessages?.common.database_error, null, null, 400);
            }
            // const idGenerated = helpers.generateIDs(usersCount?.data)


            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                delete result?.data?.password

                let ObjProfile = {
                    userId: result.data._id,
                    completionStaus: {
                        basicInfo: true
                    },

                    createdOn: helpers.getCurrentDate()
                }
                let userProfileRef = new UserProfile(ObjProfile)
                let resultProfile = await postData(userProfileRef);
                if (!resultProfile.status) {
                    await deleteData(Users, { _id: userRef._id })
                    return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 400);
                }

                let link = `${consts.FRONTEND_URL}/#/login`
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
                return helpers.showResponse(true, ResponseMessages?.users?.register_success, result?.data, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 400);
        } catch (err) {
            console.log(err, "err while register new user");
            return helpers.showResponse(false, ResponseMessages?.users?.register_error, err, null, 400);
        }

    },
    login: async (data, request, response) => {
        try {
            let { isLoginFromShopify, password, email, fcmToken } = data
            let queryObject = { email: email }

            let result = await getSingleData(Users, queryObject, '');
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 400);
            }

            let CheckUserStatus = await getSingleData(Users, { email, status: { $in: [2, 4] } }, '');

            if (CheckUserStatus.status) {
                let status = CheckUserStatus.data.status
                return helpers.showResponse(false, status == 2 ? "Account Deleted !! Contact Support" : "Account Deactivated !! Contact Support", null, null, 400);
            }

            let userData = result?.data
            if (userData?.password !== md5(password)) {
                return helpers.showResponse(false, ResponseMessages?.users?.invalid_credentials, null, null, 403);
            }
            if (userData?.status == 0) {
                return helpers.showResponse(false, ResponseMessages?.users?.account_disabled, null, null, 403);
            }

            let user_type = userData.userType == 3 ? 'user' : "admin"
            let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })

            let access_token = jwt.sign({ user_type: user_type, type: "access", _id: userData._id }, API_SECRET, {
                expiresIn: consts.ACCESS_EXPIRY
            });

            //save fcmToken in users collection 
            if (fcmToken && userData.userType == 3) {
                const result = await updateSingleData(Users, { fcmToken }, { _id: userData._id, status: { $ne: 3 } })
                userData.fcmToken = result?.data?.fcmToken
            }
            //generating cryptographic csrf token 
            let csrfToken = helpers.generateCsrfToken()

            //create user session and  pass csrf token 
            request.session._csrfToken = csrfToken

            delete userData._doc.password

            userData = { ...userData._doc, token: access_token }

            userData.csrfToken = csrfToken

            return helpers.showResponse(true, ResponseMessages?.users?.login_success, userData, null, 200);
        } catch (err) {
            console.log(err, "err");
            return helpers.showResponse(false, ResponseMessages?.users?.login_error, null, null, 400);
        }
    },

    logout: async (data, userId) => {
        let queryObject = { _id: userId }
        let result = await getSingleData(Users, queryObject, 'traceId');
        if (!result.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 400);
        }

        // await updateSingleData(Users, { csrfToken: null }, { _id: userId, status: { $ne: 3 } })

        let userData = result?.data
        return helpers.showResponse(true, ResponseMessages?.users?.logout_success, userData, null, 200);
    },
    refreshCsrfToken: async (request, userId) => {
        try {
            // let data = await getSingleData(Users, { _id: userId, status: { $ne: 2 } })
            // let userData = data.data
            if (request?.session?._csrfToken) {
                // let newCsrfToken = helpers.generateCsrfToken();
                // request.session._csrfToken = newCsrfToken;

                return helpers.showResponse(true, 'Token Generated Successfully', { csrfToken: request?.session?._csrfToken }, null, 200);
            } else {
                let newCsrfToken = helpers.generateCsrfToken();
                request.session._csrfToken = newCsrfToken;
                return helpers.showResponse(true, 'Token Generated Successfully', { csrfToken: newCsrfToken }, null, 200);
                // return helpers.showResponse(false, 'Session not available', null, null, 500);
            }
        } catch (error) {
            console.error('Error refreshing CSRF token:', error);
            return helpers.showResponse(false, 'Error refreshing CSRF token', null, null, 500);
        }
    },


    forgotPassword: async (data) => {
        let { email } = data;
        try {
            let emailExistanceResponse = await UserUtils.checkEmailExistance(email)
            if (emailExistanceResponse?.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.invalid_email, null, null, 400);
            }
            let userData = emailExistanceResponse?.data

            let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
            let token = jwt.sign({ user_type: "user", type: "access", _id: userData?._id }, API_SECRET, {
                expiresIn: consts.ACCESS_EXPIRY
            });

            let link = `${consts.FRONTEND_URL}/#/resetPassword?resetPasswordToken=${token}&&email=${email}`
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
            if (emailResponse?.status) {
                return helpers.showResponse(true, ResponseMessages.users.verification_email_sent, true, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages?.users?.verification_email_error, null, null, 400);
        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.users?.verification_email_error, err, null, 400);
        }
    },

    resetPassword: async (data) => {
        let { email, resetPasswordToken, newPassword } = data;
        let queryObject = { email: email }
        let response = await getSingleData(Users, queryObject, '')
        if (!response?.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_email, null, null, 400);
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
        let result = await updateData(Users, editObj, new ObjectId(userData?._id))
        if (!result?.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.password_reset_error, null, null, 400);
        }
        return helpers.showResponse(true, ResponseMessages?.users?.password_reset_success, null, null, 200);
    },

    changePasswordWithOld: async (data, user_id) => {
        let { oldPassword, newPassword, userId } = data;

        let result = await getSingleData(Users, { password: { $eq: md5(oldPassword) }, _id: new ObjectId(user_id) });
        if (!result.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_old_password, null, null, 400);
        }
        let updatedData = {
            password: md5(newPassword),
            updatedOn: helpers.getCurrentDate()
        }
        let response = await updateByQuery(Users, updatedData, { password: { $eq: md5(oldPassword) }, _id: new ObjectId(user_id) });
        if (response.status) {
            return helpers.showResponse(true, ResponseMessages.users.password_change_successfull, null, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages.users.password_change_failed, null, null, 400);
    },

    // // with token 
    getUserDetail: async (data) => {
        let { user_id } = data;

        let result = await Users.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(user_id), status: { $ne: 2 } } },  // Match the specific user by _id and status

            {
                $lookup: {
                    from: "userProfile",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userProfileData",
                    pipeline: [
                        {
                            $project: {
                                storeDetails: 0
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$userProfileData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    fullName: {
                        $concat: ['$firstName', ' ', '$lastName']
                    },
                    ncResaleInfo: {
                        isExemptionEligible: "$userProfileData.isExemptionEligible",
                        ncResaleCertificate: "$userProfileData.ncResaleCertificate"
                    },
                    userProfileData: "$userProfileData", // Include the 'userProfileData' field
                }
            },
            {
                $unset: "password" // Exclude the 'password' field
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            // {
                            //     _id: '$_id',
                            //     firstName: '$firstName',
                            //     lastName: '$lastName',
                            //     email: '$email',
                            //     // Add other fields from the Users collection that you want to include
                            // },
                            "$$ROOT",
                            {
                                fullName: {
                                    $concat: ['$firstName', ' ', '$lastName']
                                },
                                storeAccessToken: "$storeAccessToken",
                                ncResaleInfo: {
                                    isExemptionEligible: "$userProfileData.isExemptionEligible",
                                    ncResaleCertificate: "$userProfileData.ncResaleCertificate"
                                },

                            }
                        ]
                    }
                }
            },
            // {
            //     $unset: "userProfileData" // Exclude the 'password' field
            // },
        ]);
        console.log(result, "resulttttuser");
        if (result.length === 0) {
            return helpers.showResponse(false, 'User Not found ', null, null, 400);
        }

        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, result.length > 0 ? result[0] : {}, null, 200);
    },

    getUserStatus: async (data) => {
        let { user_id } = data
        let result = await getSingleData(Users, { _id: user_id }, 'status');

        if (!result) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 400);
        }

        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, result?.data, null, 200);
    },

    updateBasicDetails: async (data, user_id, profileImg) => {
        let queryObject = { _id: user_id }

        let checkUser = await getSingleData(Users, queryObject, '');
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 400);
        }
        data.updatedOn = helpers.getCurrentDate();

        if (profileImg) {
            //upload image to aws s3 bucket
            const s3Upload = await helpers.uploadFileToS3([profileImg])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }

            data.profileImagePath = s3Upload?.data[0]
        }

        let result = await updateSingleData(Users, data, { _id: user_id })
        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result?.data, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },
    updateStoreDetails: async (data, user_id) => {

        let { apiKey, shop, secret, storeVersion } = data

        //add current static version of shopify
        storeVersion = "2023-10"

        // secret = "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"
        // shop = "@sunil-mww"
        // apiKey = "f479e5e97f4ab23bde3f74df1c21e23a"

        let updateData = {
            updatedOn: helpers.getCurrentDate(),
            storeDetails: {
                apiKey: apiKey,
                shop: shop,
                secret: secret,
                storeVersion: storeVersion
            }
        }

        let result = await updateSingleData(UserProfile, updateData, { user_id: user_id })
        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },
    updateOrderSubmissionDelay: async (data, user_id) => {

        let { orderSubmissionDelay } = data

        let updateObj = {
            updatedOn: helpers.getCurrentDate(),
            orderSubmissionDelay
        }

        let result = await updateSingleData(Users, updateObj, { _id: user_id })

        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },
    updatePersonalDetails: async (data, user_id) => {
        let queryObject = { _id: user_id }
        let checkUser = await getSingleData(Users, queryObject, '');
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 400);
        }
        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(UserProfile, data, { userId: user_id })
        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result?.data, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },
    updateShippingDetails: async (data, userId) => {
        let queryObject = { _id: userId }

        console.log(data, "dataaaShip");
        let checkUser = await getSingleData(Users, queryObject, '');
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 400);
        }
        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(UserProfile, data, { userId })

        if (result.status) {
            let updateRes = await updateSingleData(UserProfile, { 'completionStaus.shippingInfo': true }, { userId })
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },

    updateBillingAddress: async (data, userId) => {
        let queryObject = { _id: userId }

        console.log(data, "databill");
        let checkUser = await getSingleData(Users, queryObject, '');
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 400);
        }
        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(UserProfile, data, { userId })
        if (result.status) {
            await updateSingleData(UserProfile, { 'completionStaus.billingInfo': true }, { userId })
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },

    updatePaymentDetails: async (data, userId) => {
        try {
            let { paymentDetails } = data
            // data.updatedOn = helpers.getCurrentDate();

            const findUser = await getSingleData(Users, { _id: userId })
            if (!findUser.status) {
                return helpers.showResponse(false, ResponseMessages.users.account_not_exist, null, null, 400)
            }
            const payTraceToken = await helpers.generatePayTraceToken();

            if (!payTraceToken.status) {
                return helpers.showResponse(false, "PayTrace Token Not Generated", payTraceToken.data, null, 400)
            }

            let customerId

            //if user has customer id then update card details 
            if (paymentDetails?.customerId) {
                console.log("under ifffe");

                customerId = paymentDetails?.customerId
            } else {
                console.log("under elseef");
                let count = await getCount(Users, { userType: 3 })
                let idGenerated = helpers.generateIDs(count?.data)
                console.log(idGenerated, "id generateddd");
                customerId = idGenerated.customerID
            }

            console.log(customerId, "customeridd");

            const dataPaytrace = {
                // customer_id: 89861252,
                customer_id: customerId,
                credit_card: {
                    number: paymentDetails.creditCardData.ccNumber,
                    expiration_month: paymentDetails.creditCardData.expirationMonth,
                    expiration_year: paymentDetails.creditCardData.expirationYear,
                },
                integrator_id: consts.PAYTRACE_IntegratorID,
                billing_address: {
                    name: paymentDetails?.billingAddressData?.name,
                    street_address: paymentDetails?.billingAddressData?.streetAddress,
                    city: paymentDetails?.billingAddressData?.city,
                    state: paymentDetails?.billingAddressData?.stateName,
                    zip: paymentDetails?.billingAddressData?.zipCode,
                    country: paymentDetails?.billingAddressData?.country
                },
            };


            let payTrace

            //if cutomer id is present then update paytrace details
            if (paymentDetails?.customerId) {
                console.log("update side paytrace");
                payTrace = await helpers.updatePaytraceInfo(dataPaytrace, payTraceToken.data.access_token)

                //else create paytrace id for user with payment details

            } else {
                console.log("create side paytrace");

                payTrace = await helpers.generatePaytraceId(dataPaytrace, payTraceToken.data.access_token)

            }


            // console.log(getPaytraceId, "getPaytraceId");
            if (!payTrace.status) {
                console.log(payTrace, "payTracepayTrace");
                return helpers.showResponse(false, payTrace.data, payTrace.message, null, 400)
            }
            let { customer_id, masked_card_number } = payTrace.data

            //assign payload data to variable 
            let paymentdetailsData = data

            // console.log(paymentdetailsData, "45455455");
            paymentdetailsData.paymentDetails.creditCardData.ccNumber = masked_card_number
            paymentdetailsData.paymentDetails.customerId = customer_id
            paymentdetailsData.updatedOn = helpers.getCurrentDate();
            let completionStaus = { 'completionStaus.paymentInfo': true }

            // console.log(paymentdetailsData, "dddsdsd");
            let userProfile = await updateSingleData(UserProfile, { ...paymentdetailsData, ...completionStaus }, { userId })

            if (!userProfile.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
            }

            let addUserPaytraceId = await updateSingleData(Users, { payTraceId: Number(customer_id), updatedOn: helpers.getCurrentDate() }, { _id: userId })

            if (!addUserPaytraceId.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
            }
            // console.log(userProfile, "userProfile");

            //---------------email send to admin that new user has been regsitered
            let basicInfo = userProfile?.data.completionStaus?.basicInfo
            let billingInfo = userProfile?.data.completionStaus?.billingInfo
            let paymentInfo = userProfile?.data.completionStaus?.paymentInfo
            let shippingInfo = userProfile?.data.completionStaus?.shippingInfo


            //if user complete its profile then send email to user and admin with details
            if (basicInfo && billingInfo && paymentInfo && shippingInfo) {
                console.log("under complete profile iff");

                //create excel 
                let newUserCsvData = [
                    {
                        cust_Id: userProfile?.data?.paymentDetails?.customerId,
                        company_name: userProfile?.data?.shippingAddress?.companyName ?? "",
                        customer_name: userProfile?.data?.shippingAddress?.companyName ?? "",
                        address1: userProfile?.data?.shippingAddress?.address1 ?? "",
                        address2: userProfile?.data?.shippingAddress?.address2 ?? "",
                        city: userProfile?.data?.shippingAddress?.city ?? "",
                        state: userProfile?.data?.shippingAddress?.stateName ?? "",
                        country: userProfile?.data?.shippingAddress?.country ?? "",
                        zip: userProfile?.data?.shippingAddress?.zipCode ?? "",
                        email: userProfile?.data?.shippingAddress?.companyEmail ?? "",
                        phone: userProfile.data?.shippingAddress?.companyPhone ?? "",
                        tax_id: userProfile.data?.shippingAddress?.taxId ?? "",

                        paytrace_token: payTraceToken?.data?.access_token ?? "",

                        billing_name: userProfile?.data?.billingAddress?.contactName ?? "",
                        billing_address1: userProfile?.data?.billingAddress?.address1 ?? "",
                        billing_address2: "",
                        billing_city: userProfile?.data?.billingAddress?.city ?? "",
                        billing_state: userProfile?.data?.billingAddress?.stateName ?? "",
                        billing_country: userProfile?.data?.billingAddress?.country ?? "",
                        billing_zip: userProfile?.data?.billingAddress?.zipCode ?? "",

                        credit_name: userProfile?.data?.paymentDetails?.billingAddressData?.name ?? "",
                        credit_address1: userProfile?.data?.paymentDetails?.billingAddressData?.streetAddress ?? "",
                        credit_city: userProfile?.data?.paymentDetails?.billingAddressData?.city ?? "",
                        credit_state: userProfile?.data?.paymentDetails?.billingAddressData?.stateName ?? "",
                        credit_country: userProfile?.data?.paymentDetails?.billingAddressData?.country ?? "",
                        credit_zip: userProfile?.data?.paymentDetails?.billingAddressData?.zipCode ?? "",
                    }

                ]

                // let fields = ["cust_Id", "company_name", "customer_name"];
                // const parser = new Parser({
                //     fields,
                //     // unwind: ["car.name", "car.price", "car.color"]
                // });
                // const csv = parser.parse(newUserCsvData);
                // console.log('output',csv)
                const sheet = await helpers.sendExcelAttachement(newUserCsvData)

                let link = `${consts.BITBUCKET_URL}/${sheet.data}`
                const logoPath = path.join(__dirname, '../views', 'logo.png');

                const htmlAdmin = await ejs.renderFile(path.join(__dirname, '../views', 'newRegistration.ejs'), { link, cidLogo: 'unique@mwwLogo' });
                const htmlUser = await ejs.renderFile(path.join(__dirname, '../views', 'userProfileUpdated.ejs'), { cidLogo: 'unique@mwwLogo' });

                //send email of attachment to admin
                // let to = `checkkk@yopmail.com`
                let to = `${consts.ADMIN_EMAIL}`
                let subject = `New user registered`
                let attachments = [
                    {
                        filename: 'userDetail.xlsx',
                        path: link,

                    },
                    {
                        filename: 'logo.png',
                        path: logoPath,
                        cid: 'unique@mwwLogo',
                    }
                ]
                //send email to user
                let toUser = findUser?.data?.email
                let subjectUser = `Profile Updated`
                let attachmentsUser = [

                    {
                        filename: 'logo.png',
                        path: logoPath,
                        cid: 'unique@mwwLogo',
                    }
                ]

                let emailToAdmin = await helpers.sendEmailService(to, subject, htmlAdmin, attachments)
                let emailToUser = await helpers.sendEmailService(toUser, subjectUser, htmlUser, attachmentsUser)
                //----------
            }


            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, null, null, 200);
        } catch (error) {
            console.log(error, "erorrrrPayment");
            return helpers.showResponse(false, error?.message ? error.message : error, null, null, 400);

        }

    },
    // generateStoreToken: async (data, res) => {
    //     try {
    //         let { shop, code } = data
    //         console.log(shop, "shop-------");

    //         res.redirect(`https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${process.env.SHOPIFY_REDIRECT}`);

    //         // const response = await axios.get(`https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${process.env.SHOPIFY_REDIRECT}`);

    //         // console.log(response, "responseresponse");
    //         // Store the access token
    //         // const accessToken = response.data.access_token;
    //         // // let accessToken = "e"
    //         // console.log('Access Token:', accessToken);
    //         // if (!accessToken) {
    //         //     return helpers.showResponse(false, "Token Generation Failed", {}, null, 400);
    //         // }
    //         // let updateData = {
    //         //     storeAccessToken: accessToken,
    //         //     updatedOn: helpers.getCurrentDate()
    //         // }
    //         // let result = await updateSingleData(Users, updateData, { _id: userId })

    //         // if (!result.status) {
    //         //     return helpers.showResponse(false, ResponseMessages.common.update_failed, {}, null, 400);
    //         // }
    //         // return helpers.showResponse(true, "Generate Successfully", null, null, 200);

    //     } catch (error) {
    //         console.log(error, "errorrrr");
    //         return helpers.showResponse(false, error.message, null, null, 400);

    //     }
    // },
    // shopifyAccess: async (data, res) => {
    //     try {
    //         let { shop, code } = data
    //         console.log(shop, "shop-------");

    //         const query = {
    //             client_id: "ef6a3b54af0bd843a040ccdabc47edae", // Your API key
    //             client_secret: "279508be83ce3b4bc0323e399685bbe8", // Your app credentials (secret key)
    //             code: code // Grab the access key from the URL
    //         };

    //         const access_token_url = `https://${shop}/admin/oauth/access_token?client_id=${query.client_id}&client_secret=${query.client_secret}&code=${query.code}`;
    //         let response = await axios.post(access_token_url,
    //             {
    //                 headers: { "Content-Type": "application/json" }
    //             })


    //         console.log(response, "responseresponse");
    //         // Store the access token
    //         // const accessToken = response.data
    //         // console.log(accessToken, "accessToken");
    //         // // let accessToken = "e"
    //         // console.log('Access Token:', accessToken);
    //         // if (!accessToken) {
    //         //     return helpers.showResponse(false, "Token Generation Failed", {}, null, 400);
    //         // }
    //         // let updateData = {
    //         //     storeAccessToken: accessToken,
    //         //     updatedOn: helpers.getCurrentDate()
    //         // }
    //         // let result = await updateSingleData(Users, updateData, { _id: userId })

    //         // if (!result.status) {
    //         //     return helpers.showResponse(false, ResponseMessages.common.update_failed, {}, null, 400);
    //         // }
    //         return helpers.showResponse(true, "Generate Successfully", null, null, 200);

    //     } catch (error) {
    //         console.log(error, "errorrrr");
    //         return helpers.showResponse(false, error.message, null, null, 400);

    //     }
    // },
    // redirectShopify: async (data, userId) => {
    //     try {
    //         let { shop, code } = data
    //         console.log(code, shop, "code- shop------redirect");

    //         let query = {
    //             client_id: "ef6a3b54af0bd843a040ccdabc47edae",
    //             client_secret: "279508be83ce3b4bc0323e399685bbe8",
    //             code: "ac6c881e2f3d6e744ee9c4592e0e9839"
    //             //   scope:process.env.SHOPIFY_SCOPES,
    //         }
    //         // let query = {
    //         //     client_id: process.env.SHOPIFY_CLIENT_ID,
    //         //     client_secret: process.env.SHOPIFY_SECRET,
    //         //     //   scope:process.env.SHOPIFY_SCOPES,
    //         // }

    //         const access_token_url = `https://${shop}/admin/oauth/access_token`;
    //         const response = await axios.post(access_token_url, null, {
    //             params: query,
    //             headers: { "Content-Type": "application/json" },
    //         });

    //         console.log(response, "responseresponse redirectShopify");



    //         return helpers.showResponse(true, "redirect Successfully", null, null, 200);

    //     } catch (error) {
    //         console.log(error, "errorrrr");
    //         return helpers.showResponse(false, error.message, null, null, 400);

    //     }
    // },

}

module.exports = {
    ...UserUtils
}