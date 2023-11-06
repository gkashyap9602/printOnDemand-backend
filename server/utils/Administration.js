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
const UserProfile = require('../models/UserProfile')
const WaitingList = require('../models/WaitingList')
const Notification = require('../models/notification')

const adminUtils = {

    // login: async (data) => {
    //     let { email, password } = data;
    //     let where = {
    //         email: email,
    //         password: md5(password),
    //         status: { $eq: 1 }
    //     }
    //     let result = await getSingleData(Administration, where, '');
    //     if (result.status) {
    //         let adminData = result?.data
    //         let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
    //         let access_token = jwt.sign({ user_type: "admin", type: "access", _id: adminData?._id }, API_SECRET, {
    //             expiresIn: consts.ACCESS_EXPIRY
    //         });
    //         // let refresh_token = jwt.sign({ user_type: "admin", type: "refresh" }, API_SECRET, {
    //         //     expiresIn: consts.REFRESH_EXPIRY
    //         // });
    //         delete adminData?._doc?.password
    //         adminData = { ...adminData?._doc, token: access_token }

    //         return helpers.showResponse(true, ResponseMessages?.admin?.login_success, adminData, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.invalid_login, null, null, 400);
    // },
    // logout: async (adminId) => {
    //     let queryObject = { _id: adminId }
    //     let result = await getSingleData(Administration, queryObject, 'traceId');
    //     if (!result.status) {
    //         return helpers.showResponse(false, ResponseMessages?.users?.invalid_user, null, null, 400);
    //     }
    //     let adminData = result?.data
    //     return helpers.showResponse(true, ResponseMessages?.users?.logout_success, adminData, null, 200);
    // },

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
    updateWaitingList: async (data) => {
        try {
            const { value } = data
            console.log(value, "valuee")
            let result = await updateSingleData(WaitingList, { isWaitingListEnable: value })

            if (result.status) {
                return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result?.data, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
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
                        userType: 3,

                        $or: [
                            {
                                email: { $regex: searchKey, $options: 'i' },
                            },
                            {
                                firstName: { $regex: searchKey, $options: 'i' }
                            },

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
                    }
                },
                {
                    $unwind: {
                        path: "$userProfileData",
                        preserveNullAndEmptyArrays: false
                    },

                },
                {
                    $addFields: {
                        shippingAddress: '$userProfileData.shippingAddress'
                    }
                },
                {
                    $unset: 'userProfileData'
                },
            ])

            const activeUsers = await getCount(Users, { status: 1, userType: 3 })
            const pendingUsers = await getCount(Users, { status: 2, userType: 3 })
            const deactivateUsers = await getCount(Users, { status: 3, userType: 3 })
            const totalUsers = await getCount(Users, { userType: 3 })

            let statusSummary = {
                active: activeUsers.data,
                pending: pendingUsers.data,
                deactivated: deactivateUsers.data,
                total: totalUsers.data
            }

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { statusSummary, users: result }, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    createCustomer: async (data, adminId) => {
        try {
            let { firstName, lastName, email, billingAddress, paymentDetails, shippingAddress } = data;

            let existUser = await getSingleData(Users, { email })
            if (existUser.status) {
                return helpers.showResponse(false, ResponseMessages?.users.email_already, null, null, 400);
            }
            const usersCount = await getCount(Users, { userType: 3 })
            if (!usersCount.status) {
                return helpers.showResponse(false, ResponseMessages?.common.database_error, null, null, 400);
            }
            const idGenerated = helpers.generateIDs(usersCount?.data)

            let adminData = await getSingleData(Users, { _id: adminId, userType: 1 })
            console.log(adminData, "adminData", adminId)
            if (!adminData.status) {
                return helpers.showResponse(false, ResponseMessages?.users.account_not_exist, null, null, 400);
            }

            let newObj = {
                firstName,
                lastName,
                email: email,
                userName: email,
                id: idGenerated.idNumber,
                // guid: randomUUID(),
                customerId: idGenerated.customerID,
                createdUser: `${adminData?.data?.firstName} ${adminData?.data?.lastName}`,
                // customerGuid: randomUUID(),
                // password: md5(password),
                createdOn: helpers.getCurrentDate()
            }

            let userRef = new Users(newObj)
            let result = await postData(userRef);
            if (result.status) {
                // delete data.password

                let ObjProfile = {
                    userId: result.data._id,
                    completionStaus: {
                        basicInfo: true
                    },
                    createdOn: helpers.getCurrentDate()
                }
                if (billingAddress) {
                    ObjProfile.billingAddress = billingAddress
                    ObjProfile.completionStaus.billingInfo = true

                }
                if (shippingAddress) {
                    ObjProfile.shippingAddress = shippingAddress
                    ObjProfile.completionStaus.shippingInfo = true
                }
                if (paymentDetails) {
                    ObjProfile.paymentDetails = paymentDetails,
                        ObjProfile.completionStaus.paymentInfo = true
                }

                let userProfileRef = new UserProfile(ObjProfile)
                let resultProfile = await postData(userProfileRef);
                if (!resultProfile.status) {
                    //if userProfile save err then handle user is saved but throw error for profile update issue?
                    await deleteData(Users, { _id: userRef._id })
                    return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 400);
                }

                return helpers.showResponse(true, ResponseMessages?.users?.register_success, data, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 400);
        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.users?.register_error, err, null, 400);
        }

    },
    addSubAdmin: async (data,) => {
        try {
            let { firstName, lastName, email, password, access } = data;

            let subAdminData = await getSingleData(Users, { email, userType: { $in: [1, 2] } })
            if (subAdminData.status) {
                return helpers.showResponse(false, ResponseMessages?.admin.email_already, null, null, 400);
            }

            let newObj = {
                firstName,
                lastName,
                email: email,
                userName: email,
                password: md5(password),
                userType: 2,
                access,
                createdOn: helpers.getCurrentDate()
            }

            let subAdminRef = new Users(newObj)
            let result = await postData(subAdminRef);
            if (result.status) {
                delete data.password
                return helpers.showResponse(true, ResponseMessages?.admin.subAdmin_added, data, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.admin.subAdmin_save_fail, null, null, 400);
        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.users?.register_error, err, null, 400);
        }

    },

    getAllSubAdmins: async (data) => {
        try {
            let { sortColumn = 'createdOn', sortDirection = 'asc', pageIndex = 1, pageSize = 5, searchKey = '', subAdminId } = data
            pageIndex = Number(pageIndex)
            pageSize = Number(pageSize)

            console.log(pageIndex, pageSize, "pagina")
            console.log(sortColumn, sortDirection, searchKey, "extraa")

            let matchObj = {
                email: { $regex: searchKey, $options: 'i' },
                userType: 2,
                status: { $ne: 2 }
            }

            if (subAdminId) {
                matchObj._id = mongoose.Types.ObjectId(subAdminId)
            }
            console.log(subAdminId, "subAdminId");
            console.log(matchObj, "matchObj");

            const result = await Users.aggregate([
                {
                    $match: {
                        $or: [
                            { ...matchObj }

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

            ])

            const totalUsers = await getCount(Users, { userType: 2, status: { $ne: 2 } })

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { items: result, totalCount: totalUsers.data }, null, 200);
        } catch (err) {
            console.log(err, "err get side");
            return helpers.showResponse(false, ResponseMessages?.common.database_error, err, null, 400);
        }

    },
    activeInactiveUser: async (data) => {
        try {
            let { status, userId } = data
            status = Number(status)
            let result = await updateSingleData(Users, { status }, { _id: userId })
            if (result.status) {

                return helpers.showResponse(true, ResponseMessages?.common.update_sucess, null, null, 200);
            }

        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.common.update_failed, err, null, 400);
        }

    },
    updateSubAdmin: async (data) => {
        try {
            let { firstName, lastName, access, subAdminId, status } = data

            let matchObj = {
                _id: subAdminId,
                userType: 2,
                status: { $ne: 2 }
            }

            let updateObj = {
                firstName,
                lastName,
                access
            }
            if (status) {
                updateObj.status = status
            }

            let subAdminData = await getSingleData(Users, matchObj)

            if (!subAdminData.status) {
                return helpers.showResponse(false, ResponseMessages?.common.not_exist, null, null, 400);
            }

            let result = await updateSingleData(Users, updateObj, matchObj)
            if (result.status) {
                return helpers.showResponse(true, ResponseMessages?.common.update_sucess, null, null, 200);
            }

        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.common.update_failed, err, null, 400);
        }

    },
    saveNotification: async (data) => {
        try {
            const { type, title, userIds, description } = data

            console.log(userIds, "useridds");

            let obj = {
                type,
                title,
                userIds,
                description,
                createdOn: helpers.getCurrentDate(),
            }
            let notiRef = new Notification(obj)
            let result = await postData(notiRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.data_save, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    getNotifications: async (data) => {
        try {
            let { type, title, pageIndex = 1, pageSize = 10 } = data
            pageIndex = Number(pageIndex)
            pageSize = Number(pageSize)

            let matchObj = {
                status: { $ne: 2 }
            }

            let aggregationPipeline = [
                {
                    $match: {
                        ...matchObj
                    },
                },

                {
                    $skip: (pageIndex - 1) * pageSize // Skip records based on the page number
                },
                {
                    $limit: pageSize // Limit the number of records per page
                },
                {
                    $sort: { createdOn: -1 } // Sort by a timestamp field in descending order (latest first)
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userIds",
                        foreignField: "_id",
                        as: "usersData",
                    }
                },
                {
                    $addFields: {
                        users: {
                            $map: {
                                input: '$usersData',
                                as: 'user',
                                in: {
                                    _id: '$$user._id',
                                    name: {
                                        $concat: ['$$user.firstName', ' ', '$$user.lastName']
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        createdOn: 1,
                        type: 1,
                        users: 1
                    }
                }
            ]

            if (type) {
                aggregationPipeline.push(
                    {
                        $match: {
                            type: type,
                        },
                    }
                );
                matchObj.type = type
            }
            let totalCount = await getCount(Notification, matchObj)
            const result = await Notification.aggregate(aggregationPipeline)
            console.log(result, "resultt");

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { items: result, totalCount: totalCount.data }, null, 200);

        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    deleteNotification: async (data) => {
        try {
            const { type, notificationId } = data

            const find = await getSingleData(Notification, { _id: notificationId, type, status: { $ne: 2 } })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
            }

            const result = await updateSingleData(Notification, { status: 2 }, { _id: notificationId, type })
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
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
    //     let resordWithOld: async (data, admin_id) => {
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
    // },turn helpers.showResponse(true, ResponseMessages?.admin?.admin_details, result.data, null, 200);
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