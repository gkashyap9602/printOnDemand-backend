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
            let count = await getCount(Users, { userType: 3 })
            let idGenerated = helpers.generateIDs(count?.data)
            console.log(idGenerated, "id generateddd");
            let newObj = {
                firstName,
                lastName,
                email: email,
                userName: email,
                phoneNumber,
                // id: idGenerated.idNumber,
                // guid: randomUUID(),
                customerId: idGenerated.customerID,
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
                    as: "userProfileData"
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

            let queryObject = { _id: userId }

            let checkUser = await getSingleData(Users, queryObject, '');
            if (!checkUser?.status) {
                return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 400);
            }

            data.updatedOn = helpers.getCurrentDate();

            let result = await updateSingleData(UserProfile, data, { userId })
            if (result.status) {
                await updateSingleData(UserProfile, { 'completionStaus.paymentInfo': true }, { userId })

                let credential = `grant_type=password&username=${consts.PAYTRACE_USERNAME}&password=${consts.PAYTRACE_PASSWORD}`

                const geenratePayTraceToken = await axios.post(`${consts.PAYTRACE_URL}/oauth/token`, credential, {
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                console.log(geenratePayTraceToken, "geenratePayTraceToken");

                console.log(checkUser, "checkUser");
                console.log(data, "data");

                if (geenratePayTraceToken?.data?.access_token) {

                    let userProfile = await getSingleData(UserProfile, { userId });


                    const dataPaytrace = {
                        customer_id: checkUser?.data?.customerId,
                        credit_card: {
                            number: data.paymentDetails.creditCardData.ccNumber,
                            expiration_month: data.paymentDetails.creditCardData.expirationMonth,
                            expiration_year: data.paymentDetails.creditCardData.expirationYear,
                        },
                        integrator_id: consts.PAYTRACE_IntegratorID,
                        billing_address: {
                            name: 'Sunil Bhatia',
                            street_address: 'Six forks rd',
                            city: 'Raleigh',
                            state: 'NC',
                            zip: '27591',
                            country: 'US',
                        },
                        // billing_address: {
                        //     name: userProfile.billingAddress.contactName,
                        //     street_address: userProfile.billingAddress.address1,
                        //     city: userProfile.billingAddress.city,
                        //     state: userProfile.billingAddress.stateName,
                        //     zip: userProfile.billingAddress.zipCode,
                        //     country: userProfile.billingAddress.country,
                        // },
                    };
                    const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${geenratePayTraceToken?.data?.access_token}`,
                    };

                    const generatePaytraceId = await axios.post(`${consts.PAYTRACE_URL}/v1/customer/create`, dataPaytrace, { headers })

                    console.log(generatePaytraceId, "generatePaytraceId");

                    if (generatePaytraceId.data.response_code === 160) {
                        // { 'completionStaus.paymentInfo': true }

                        let updateObj = {
                            'paymentDetails.creditCardData.ccNumber': generatePaytraceId.data.masked_card_number,

                        }
                        console.log(generatePaytraceId.data.customer_id, "payyyy");
                        let updateProfilee = await updateSingleData(UserProfile, updateObj, { userId })

                        let updatePaytrace = await updateSingleData(Users, { payTraceId: Number(generatePaytraceId.data.customer_id) }, { _id: userId })

                        //===========payyyy

                        //create excel 
                        let array = [
                            {
                                cust_Id: checkUser?.data?.customerId,
                                company_name: userProfile?.shippingAddress?.companyName ?? "",
                                customer_name: userProfile?.shippingAddress?.companyName ?? "",
                                address1: userProfile?.shippingAddress?.address1 ?? "",
                                address2: userProfile?.shippingAddress?.address2 ?? "",
                                city: userProfile?.shippingAddress?.city ?? "",
                                state: userProfile?.shippingAddress?.stateName ?? "",
                                country: userProfile?.shippingAddress?.country ?? "",
                                zip: userProfile?.shippingAddress?.zipCode ?? "",
                                email: userProfile?.shippingAddress?.companyEmail ?? "",
                                phone: userProfile.shippingAddress?.companyPhone ?? "",
                                tax_id: userProfile.shippingAddress?.taxId ?? "",
                                paytrace_token: geenratePayTraceToken?.data?.access_token ?? "",

                                billing_name: userProfile?.billingAddress?.contactName ?? "",
                                billing_address1: userProfile?.billingAddress?.address1 ?? "",
                                billing_address2: "",
                                billing_city: userProfile?.billingAddress?.city ?? "",
                                billing_state: userProfile?.billingAddress?.stateName ?? "",
                                billing_country: userProfile?.billingAddress?.country ?? "",
                                billing_zip: userProfile?.billingAddress?.zipCode ?? "",
                                credit_name: userProfile?.paymentDetails?.billingAddressData?.name ?? "",
                                credit_address1: userProfile?.paymentDetails?.billingAddressData?.streetAddress ?? "",
                                credit_city: userProfile?.paymentDetails?.billingAddressData?.city ?? "",
                                credit_state: userProfile?.paymentDetails?.billingAddressData?.stateName ?? "",
                                credit_country: userProfile?.paymentDetails?.billingAddressData?.country ?? "",
                                credit_zip: userProfile?.paymentDetails?.billingAddressData?.zipCode ?? "",
                            }

                        ]
                        const sheet = await helpers.sendExcelAttachement(array)


                        //send email of attachment 
                        let link = `https://d35sh5431xvp8v.cloudfront.net/${sheet.data}`
                        let to = "checkkk@yopmail.com"
                        let subject = `New user registered`
                        const logoPath = path.join(__dirname, '../views', 'logo.png');
                        let attachments = [{
                            filename: 'logo.png',
                            path: logoPath,
                            cid: 'unique@mwwLogo',
                            path: link,

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
                                 Here is The Attacthment Of User Details
                             </p>
 
                             <p style="font-family: Arial; font-size: 14px; text-align: center; margin-top: 20px;">
                             Click On Attachments to get Information <br/><br/>
                                 <a style="color: blue;" href="${link}" target="_blank">
                                  ${link} > My Profile
                                 </a><br/>
                             </p>
                         
                         </div>
 
                     </body>
                     </html>
 
             `
                        let emailResponse = await helpers.sendEmailService(to, subject, body, attachments)

                    }


                } else {
                    return helpers.showResponse(false, "PaytraceId Token Not Generated", null, null, 400);

                }

                return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
        } catch (error) {
            console.log(error, "erorrrrPayment");
            return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);

        }

    },
    generateStoreToken: async (data, res) => {
        try {
            let { shop, code } = data
            console.log(shop, "shop-------");

            res.redirect(`https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${process.env.SHOPIFY_REDIRECT}`);

            // const response = await axios.get(`https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${process.env.SHOPIFY_REDIRECT}`);

            // console.log(response, "responseresponse");
            // Store the access token
            // const accessToken = response.data.access_token;
            // // let accessToken = "e"
            // console.log('Access Token:', accessToken);
            // if (!accessToken) {
            //     return helpers.showResponse(false, "Token Generation Failed", {}, null, 400);
            // }
            // let updateData = {
            //     storeAccessToken: accessToken,
            //     updatedOn: helpers.getCurrentDate()
            // }
            // let result = await updateSingleData(Users, updateData, { _id: userId })

            // if (!result.status) {
            //     return helpers.showResponse(false, ResponseMessages.common.update_failed, {}, null, 400);
            // }
            // return helpers.showResponse(true, "Generate Successfully", null, null, 200);

        } catch (error) {
            console.log(error, "errorrrr");
            return helpers.showResponse(false, error.message, null, null, 400);

        }
    },
    shopifyAccess: async (data, res) => {
        try {
            let { shop, code } = data
            console.log(shop, "shop-------");

            const query = {
                client_id: "ef6a3b54af0bd843a040ccdabc47edae", // Your API key
                client_secret: "279508be83ce3b4bc0323e399685bbe8", // Your app credentials (secret key)
                code: code // Grab the access key from the URL
            };

            const access_token_url = `https://${shop}/admin/oauth/access_token?client_id=${query.client_id}&client_secret=${query.client_secret}&code=${query.code}`;
            let response = await axios.post(access_token_url,
                {
                    headers: { "Content-Type": "application/json" }
                })


            console.log(response, "responseresponse");
            // Store the access token
            // const accessToken = response.data
            // console.log(accessToken, "accessToken");
            // // let accessToken = "e"
            // console.log('Access Token:', accessToken);
            // if (!accessToken) {
            //     return helpers.showResponse(false, "Token Generation Failed", {}, null, 400);
            // }
            // let updateData = {
            //     storeAccessToken: accessToken,
            //     updatedOn: helpers.getCurrentDate()
            // }
            // let result = await updateSingleData(Users, updateData, { _id: userId })

            // if (!result.status) {
            //     return helpers.showResponse(false, ResponseMessages.common.update_failed, {}, null, 400);
            // }
            return helpers.showResponse(true, "Generate Successfully", null, null, 200);

        } catch (error) {
            console.log(error, "errorrrr");
            return helpers.showResponse(false, error.message, null, null, 400);

        }
    },
    redirectShopify: async (data, userId) => {
        try {
            let { shop, code } = data
            console.log(code, shop, "code- shop------redirect");

            let query = {
                client_id: "ef6a3b54af0bd843a040ccdabc47edae",
                client_secret: "279508be83ce3b4bc0323e399685bbe8",
                code: "ac6c881e2f3d6e744ee9c4592e0e9839"
                //   scope:process.env.SHOPIFY_SCOPES,
            }
            // let query = {
            //     client_id: process.env.SHOPIFY_CLIENT_ID,
            //     client_secret: process.env.SHOPIFY_SECRET,
            //     //   scope:process.env.SHOPIFY_SCOPES,
            // }

            const access_token_url = `https://${shop}/admin/oauth/access_token`;
            const response = await axios.post(access_token_url, null, {
                params: query,
                headers: { "Content-Type": "application/json" },
            });

            console.log(response, "responseresponse redirectShopify");



            return helpers.showResponse(true, "redirect Successfully", null, null, 200);

        } catch (error) {
            console.log(error, "errorrrr");
            return helpers.showResponse(false, error.message, null, null, 400);

        }
    },

}

module.exports = {
    ...UserUtils
}