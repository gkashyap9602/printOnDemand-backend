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
const middleware = require('../middleware/authentication');
const Orders = require('../models/Orders')
const Material = require("../models/Material")

const UserUtils = {

    checkEmailExistance: async (email, user_id = null) => {
        let queryObject = { email }
        if (user_id) {
            queryObject = { email, _id: { $ne: ObjectId(user_id) } }
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
    register: async (data) => {
        try {
            let { firstName, lastName, email, password } = data;

            let emailExistanceResponse = await UserUtils.checkEmailExistance(email)
            if (!emailExistanceResponse?.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.email_already, null, null, 403);
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
                // guid: randomUUID(),
                customerId: idGenerated.customerID,
                // customerGuid: randomUUID(),
                password: md5(password),
                createdOn: helpers.getCurrentDate()
            }

            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                delete data.password
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
                return helpers.showResponse(true, ResponseMessages?.users?.register_success, data, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 400);
        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.users?.register_error, err, null, 400);
        }

    },
    login: async (data, response) => {
        try {
            let { isLoginFromShopify, password, email, fcmToken } = data
            let queryObject = { email: email, status: { $ne: 3 } }

            let result = await getSingleData(Users, queryObject, '');
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 400);
            }

            let userData = result?.data
            if (userData?.password !== md5(password)) {
                return helpers.showResponse(false, ResponseMessages?.users?.invalid_credentials, null, null, 403);
            }
            if (userData?.status == 0) {
                return helpers.showResponse(false, ResponseMessages?.users?.account_disabled, null, null, 403);
            }

            let user_type = userData.userType == 1 ? 'admin' : "user"
            let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })

            let access_token = jwt.sign({ user_type: user_type, type: "access", _id: userData._id }, API_SECRET, {
                expiresIn: consts.ACCESS_EXPIRY
            });

            if (fcmToken && userData.userType == 3) {
                const result = await updateSingleData(Users, { fcmToken }, { _id: userData._id, status: { $ne: 3 } })
                // console.log(result,"update fcmToken");
                userData.fcmToken = result?.data?.fcmToken
            }
            // console.log(userData,"userData fcm after");

            delete userData._doc.password

            userData = { ...userData._doc, token: access_token }

            //generating cryptographic csrf token 
            let csrfToken = helpers.generateCsrfToken()
            //set csrf token in cookies 
            helpers.setCookie(response, csrfToken)

            console.log(csrfToken, "csrf");
            console.log(userData, 'userData');
            userData.csrfToken = csrfToken

            return helpers.showResponse(true, ResponseMessages?.users?.login_success, userData, null, 200);
        } catch (err) {
            console.log(err,"err");
            return helpers.showResponse(false, ResponseMessages?.users?.login_error, null, null, 400);
        }
    },

    logout: async (data, userId) => {
        let queryObject = { _id: userId }
        let result = await getSingleData(Users, queryObject, 'traceId');
        if (!result.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 400);
        }
        let userData = result?.data
        return helpers.showResponse(true, ResponseMessages?.users?.logout_success, userData, null, 200);
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

            let link = `${consts.FRONTEND_URL}/resetPassword?resetPasswordToken=${token}&&email=${email}`
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
        let result = await updateData(Users, editObj, ObjectId(userData?._id))
        if (!result?.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.password_reset_error, null, null, 400);
        }
        return helpers.showResponse(true, ResponseMessages?.users?.password_reset_success, null, null, 200);
    },

    changePasswordWithOld: async (data, user_id) => {
        let { oldPassword, newPassword, userId } = data;

        let result = await getSingleData(Users, { password: { $eq: md5(oldPassword) }, _id: ObjectId(user_id) });
        if (!result.status) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_old_password, null, null, 400);
        }
        let updatedData = {
            password: md5(newPassword),
            updatedOn: helpers.getCurrentDate()
        }
        let response = await updateByQuery(Users, updatedData, { password: { $eq: md5(oldPassword) }, _id: ObjectId(user_id) });
        if (response.status) {
            return helpers.showResponse(true, ResponseMessages.users.password_change_successfull, null, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages.users.password_change_failed, null, null, 400);
    },


    // // with token 
    getUserDetail: async (data) => {
        let { user_id } = data
        //check if userprofile nor register than it shows empty object??
        let result = await Users.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(user_id), status: 1 } },  // Match the specific user by _id and status

            {
                $lookup: {
                    from: "userProfile",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userProfileData"
                }
            },
            {
                $unwind: "$userProfileData"
            },
            {
                $addFields: {
                    fullName: {
                        $concat: ['$firstName', ' ', '$lastName']
                    }, // Include the 'userProfileData' field
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
                $replaceRoot: { newRoot: { $mergeObjects: ["$$ROOT", "$userProfileData"] } }
            },
            {
                $unset: "userProfileData" // Exclude the 'password' field
            },

        ])


        if (result.length === 0) {
            return helpers.showResponse(false, ResponseMessages?.common.data_not_found, null, null, 400);
        }

        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, result.length > 0 ? result[0] : {}, null, 200);
    },

    // // with token 
    getAllOrders: async (data) => {
        let { customerId, pageIndex, pageSize, sortColumn, sortDirection, status, storeIds } = data
        // console.log(customerId,"customerId")
        let obj = {
            orders: [],
            statusSummary: {
                cancelled: 0,
                error: 0,
                inProduction: 0,
                new: 0,
                received: 0,
                shipped: 0
            },
            totalCount: 0
        }

        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, obj, null, 200);
    },
    //???check what is in this api i used demo of orignal website 
    getBulkImport: async (data) => {
        let tra = "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Q1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0lcqhr1QOfaVy6CuVQ1+pHPpK5dBXKoe+Ujn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ1+rHPpa5dDXKoe+Vjn0tcqhr1UOfa1y6GuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0jcqhb1QOfaNy6BuVQ9+oHPpG5dA3Koe+UTn0dpZcon9//3m73Xcv9hfff7i9u7rZz273V7ub+zeftxeXVzc/338d5+e7q8vxYacnyGr7deTPu7urf+5u9hfXne3Nfnv354hvftve7a8+8gfvDyNf/LydXNz9fHUY+Hr76bC3s3eHd93d42s6fr3f3R6/OpyAn3b7wyt+/u7hQLd3D9+VZrXZWZa7LDt7+HelT7vd/vSPnsY8HPivt29uL263d6urf24Pp/jtm/vDIW6P1+Kwg6v9j7u/X13uPx9/dPz2+Uwfvn/YxezuOPrl7vebHz9vb2aHV3k4/3dXhxd58XAmv3t7u7vb311c7Q8Hfn3x8Zcfbi7//vlqv/16Xi7vLj79eaE/bq+vO7svXw6/fzjTN7ubVye1e3v13dv84dCez+af5OPu9urh6tjDq3s8K73jCXhzefXp0+GM3+x7V3f3fw71Fc8uL9vf/nxLff9hd3nZP+7g8AZ58fXhy8c9PuKvX78c7PDt77u7X45vq+//D1BLBwgxbjx0cSIAAChcAgBQSwECFAAUAAgICADNYEJWhZo0mu4AAADOAgAACwAAAAAAAAAAAAAAAAAAAAAAX3JlbHMvLnJlbHNQSwECFAAUAAgICADNYEJWtatXiwMCAAB6AwAADwAAAAAAAAAAAAAAAAAnAQAAeGwvd29ya2Jvb2sueG1sUEsBAhQAFAAICAgAzWBCVl2FOxNXBAAA+iYAAA0AAAAAAAAAAAAAAAAAZwMAAHhsL3N0eWxlcy54bWxQSwECFAAUAAgICADNYEJWr9/+/3IBAAD6BQAAFAAAAAAAAAAAAAAAAAD5BwAAeGwvc2hhcmVkU3RyaW5ncy54bWxQSwECFAAUAAgICADNYEJWT/D5etIAAAAlAgAAGgAAAAAAAAAAAAAAAACtCQAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHNQSwECFAAUAAgICADNYEJWI62qpFIBAACKAgAAEQAAAAAAAAAAAAAAAADHCgAAZG9jUHJvcHMvY29yZS54bWxQSwECFAAUAAgICADNYEJWh5dmjhEBAAC6AQAAEAAAAAAAAAAAAAAAAABYDAAAZG9jUHJvcHMvYXBwLnhtbFBLAQIUABQACAgIAM1gQlbh1gCAlwAAAPEAAAATAAAAAAAAAAAAAAAAAKcNAABkb2NQcm9wcy9jdXN0b20ueG1sUEsBAhQAFAAICAgAzWBCVs/eIr5nAQAA1AUAABMAAAAAAAAAAAAAAAAAfw4AAFtDb250ZW50X1R5cGVzXS54bWxQSwECFAAUAAgICADNYEJWMW48dHEiAAAoXAIAGAAAAAAAAAAAAAAAAAAnEAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1sUEsFBgAAAAAKAAoAgAIAAN4yAAAAAA=="
        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, tra, null, 200);
    },
    // createOrder: async (data,user_id) => {
    //     let { customerId,customerName,orderAmount,productName } = data

    //     console.log(customerId,"customerId")
    //     let obj = {
    //         customerGuid:customerId,
    //         user_id:user_id,
    //         customerName,
    //         orderAmount,
    //         productName,
    //         orderDate:helpers.getCurrentDate()
    //     }
    //        const result = await postData(Orders,obj)
    //     // let result = "ff"
    //     // let result = await Orders.aggregate([
    //     //     { $match: { customerGuid: mongoose.Types.ObjectId(customerId), status: 1 } },  // Match the specific user by _id and status

    //     //     {
    //     //         $lookup: {
    //     //             from: "users",
    //     //             localField: "_id",
    //     //             foreignField: "user_id",
    //     //             as: "userProfileData"
    //     //         }
    //     //     },
    //     //     {
    //     //         $unwind: "$userProfgit ileData"
    //     //     },
    //     //     {
    //     //         $addFields: {
    //     //             fullName: {
    //     //                 $concat: ['$firstName', ' ', '$lastName']
    //     //             }, // Include the 'userProfileData' field
    //     //             ncResaleInfo: {
    //     //                 isExemptionEligible: "$userProfileData.billingAddress.isExemptionEligible",
    //     //                 ncResaleCertificate: "$userProfileData.billingAddress.ncResaleCertificate"
    //     //             },
    //     //             userProfileData: "$userProfileData", // Include the 'userProfileData' field
    //     //         }
    //     //     },
    //     //     {
    //     //         $unset: "password" // Exclude the 'password' field
    //     //     },
    //     //     {
    //     //         $replaceRoot: { newRoot: { $mergeObjects: ["$$ROOT", "$userProfileData"] } }
    //     //     },
    //     //     {
    //     //         $unset: "userProfileData" // Exclude the 'password' field
    //     //     },

    //     // ])

    //     console.log(result, "resulttt")

    //     if (!result) {
    //         return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 200);
    //     }

    //     return helpers.showResponse(true, ResponseMessages?.users?.user_detail, result, null, 200);
    // },
    getUserStatus: async (data) => {
        let { user_id } = data
        let result = await getSingleData(Users, { _id: user_id }, 'status');

        if (!result) {
            return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 400);
        }

        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, result?.data, null, 200);
    },

    updateBasicDetails: async (data, user_id) => {
        let queryObject = { _id: user_id }

        let checkUser = await getSingleData(Users, queryObject, '');
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 400);
        }
        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(Users, data, { _id: user_id })
        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, result?.data, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },
    updateShippingDetails: async (data, userId) => {
        let queryObject = { _id: userId }

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
        console.log(data, "dataa")
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
        let queryObject = { _id: userId }

        let checkUser = await getSingleData(Users, queryObject, '');
        if (!checkUser?.status) {
            return helpers.showResponse(false, ResponseMessages.users.invalid_user, checkUser?.data, null, 400);
        }

        data.updatedOn = helpers.getCurrentDate();

        let result = await updateSingleData(UserProfile, data, { userId })
        if (result.status) {
            await updateSingleData(UserProfile, { 'completionStaus.paymentInfo': true }, { userId })
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },

}

module.exports = {
    ...UserUtils
}