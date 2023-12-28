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
const ShipMethod = require("../models/ShipMethod")
const path = require('path')
const ejs = require('ejs')
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
                return helpers.showResponse(false, ResponseMessages?.material.material_already, {}, null, 400);
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
    addShipMethod: async (data) => {
        try {
            const { name, shipMethod } = data

            const findMaterial = await getSingleData(ShipMethod, { name: name, shipMethod })
            if (findMaterial.status) {
                return helpers.showResponse(false, ResponseMessages?.common.already_existed, {}, null, 400);
            }

            let obj = {
                name,
                shipMethod,
                createdOn: helpers.getCurrentDate(),
            }
            let shipMethodRef = new ShipMethod(obj)
            let result = await postData(shipMethodRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.added_success, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    updateMaterial: async (data) => {
        let { materialId, name, status } = data
        let updateObj = {
            updatedOn: helpers.getCurrentDate()
        }

        if (status) {
            updateObj.status = status
        }
        if (name) {
            updateObj.name = name
        }
        let matchObj = {
            _id: mongoose.Types.ObjectId(materialId),
            status: { $ne: 2 }
        }

        const find = await getSingleData(Material, matchObj)
        if (!find.status) {
            return helpers.showResponse(false, ResponseMessages?.material.not_exist, {}, null, 400);
        }

        let response = await updateSingleData(Material, data, matchObj);
        if (response.status) {
            return helpers.showResponse(true, status ? "Delete Successfully" : ResponseMessages.common.update_sucess, null, null, 200);
        }
        return helpers.showResponse(false, status ? "Error While Deleting" : ResponseMessages.common.update_failed, response, null, 400);
    },
    updateWaitingList: async (data) => {
        try {
            const { value } = data
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
            let { sortColumn = 'createdOn', sortDirection = 'asc', pageIndex = 1, pageSize = 10, searchKey = '', status } = data
            pageIndex = Number(pageIndex)
            pageSize = Number(pageSize)

            let matchObj = {
                userType: 3,

            }

            if (status) {
                matchObj.status = Number(status)
            }
            console.log({ ...matchObj }, "matchhhh");
            let aggregate =
                [
                    {
                        $match: {
                            ...matchObj,

                            $or: [
                                {
                                    email: { $regex: searchKey, $options: 'i' },
                                },
                                // {
                                //     firstName: { $regex: searchKey, $options: 'i' }
                                // },

                            ]
                        }
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
                        $lookup: {
                            from: "orders",
                            localField: "_id",
                            foreignField: "customerId",
                            as: "ordersData",
                            pipeline: [
                                {
                                    $group: {
                                        _id: null,
                                        totalOrder: { $sum: 1 }
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $unwind: {
                            path: "$ordersData",
                            preserveNullAndEmptyArrays: true
                        },

                    },
                    {
                        $addFields: {
                            shippingAddress: '$userProfileData.shippingAddress'
                        }
                    },
                    {
                        $addFields: {
                            customerId: '$userProfileData.paymentDetails.customerId'
                        }
                    },
                    {
                        $addFields: {
                            numberOfOrders: "$ordersData.totalOrder"
                        }
                    },
                    {
                        $project: {
                            userProfileData: 0,
                            ordersData: 0,
                        }
                    }
                ]
            //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
            let { totalCount, aggregation } = await helpers.getCountAndPagination(Users, aggregate, pageIndex, pageSize)
            console.log(totalCount, "totalCounttotalCount");
            // let pagePipelineCount = [...aggregate];

            // pagePipelineCount.push({ $count: 'totalEntries' })

            // let countResult = await Users.aggregate(pagePipelineCount)

            // let totalCount = countResult?.[0]?.totalEntries || 0;

            // aggregate.push(
            //     {
            //         $skip: (pageIndex - 1) * pageSize
            //     },
            //     {
            //         $limit: pageSize
            //     }
            // );

            const result = await Users.aggregate(aggregation)

            const activeUsers = await getCount(Users, { status: 1, userType: 3 })
            const pendingUsers = await getCount(Users, { status: 3, userType: 3 })
            const deactivateUsers = await getCount(Users, { status: 4, userType: 3 })
            const totalUsers = await getCount(Users, { userType: 3 })

            let statusSummary = {
                active: activeUsers.data,
                pending: pendingUsers.data,
                deactivated: deactivateUsers.data,
                total: totalUsers.data
            }


            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { statusSummary, users: result, totalCount }, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    getCustomerDetails: async (data) => {
        let { customerId } = data;
        console.log(customerId, "useridd");
        let result = await Users.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(customerId) } },  // Match the specific user by _id and status

            {
                $lookup: {
                    from: "userProfile",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userProfileData",
                }
            },
            {
                $unwind: "$userProfileData"
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

        if (result.length === 0) {
            return helpers.showResponse(false, 'User Not found ', null, null, 400);
        }

        return helpers.showResponse(true, ResponseMessages?.users?.user_detail, result.length > 0 ? result[0] : {}, null, 200);
    },
    createCustomer: async (data, adminId) => {
        try {
            let { firstName, lastName, email, billingAddress, paymentDetails, shippingAddress, payTraceId } = data;

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
            if (!adminData.status) {
                return helpers.showResponse(false, ResponseMessages?.admin.admin_account_error, null, null, 400);
            }

            let newObj = {
                firstName,
                lastName,
                email: email,
                userName: email,
                createdUser: `${adminData?.data?.firstName} ${adminData?.data?.lastName}`,
                // id: idGenerated.idNumber,
                // guid: randomUUID(),
                // customerId: idGenerated.customerID,
                // customerGuid: randomUUID(),
                // password: md5(password),
                // payTraceId: payTraceId,
                createdOn: helpers.getCurrentDate()
            }


            if (payTraceId && !paymentDetails) {
                newObj.payTraceId = payTraceId
            }

            //create new customer account
            let userRef = new Users(newObj)
            let result = await postData(userRef);
            console.log(result, "result user save");

            //If User Register Successfullt then create its profile
            if (result.status) {
                delete result?.data?.password

                let ObjProfile = {
                    userId: result.data._id,
                    completionStaus: {
                        basicInfo: true
                    },

                    createdOn: helpers.getCurrentDate()
                }

                //if paytrace id added by admin then update customerID also
                if (payTraceId && !paymentDetails) {
                    console.log(payTraceId, "paytraceId");
                    ObjProfile.paymentDetails = {}
                    ObjProfile.paymentDetails.customerId = payTraceId
                }

                let userProfileRef = new UserProfile(ObjProfile)
                let resultProfile = await postData(userProfileRef);
                console.log(resultProfile, "resultProfile");
                if (!resultProfile.status) {
                    await deleteData(Users, { _id: userRef._id })
                    return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 400);
                }
                //User And his Profile has been created now update additional feilds in user profile

                if (billingAddress) {
                    let obj = {
                        billingAddress: billingAddress,
                        'completionStaus.billingInfo': true
                    }

                    let userBillingAddress = await updateSingleData(UserProfile, obj, { userId: result?.data?._id })

                }
                if (shippingAddress) {

                    let obj = {
                        shippingAddress: shippingAddress,
                        'completionStaus.shippingInfo': true
                    }

                    let userShippingAddress = await updateSingleData(UserProfile, obj, { userId: result?.data?._id })
                }


                if (paymentDetails && !payTraceId) {

                    const payTraceToken = await helpers.generatePayTraceToken();

                    if (!payTraceToken.status) {
                        return helpers.showResponse(false, "PayTrace Token Not Generated", payTraceToken.data, null, 400)
                    }
                    //get total count of the users 
                    let count = await getCount(Users, { userType: 3 })
                    let idGenerated = helpers.generateIDs(count?.data)
                    console.log(idGenerated, "id generateddd");

                    //paytrace ID Data
                    const dataPaytrace = {
                        // customer_id: 77715522,
                        customer_id: idGenerated.customerID,
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
                    //generate Paytrace Id
                    let getPaytraceId = await helpers.generatePaytraceId(dataPaytrace, payTraceToken.data.access_token)
                    console.log(getPaytraceId, "getPaytraceId");
                    if (!getPaytraceId.status) {
                        return helpers.showResponse(false, getPaytraceId.data, getPaytraceId.message, null, 400)
                    }
                    //retrieve paytrace id and mask card number
                    let { customer_id, masked_card_number } = getPaytraceId.data

                    //assigning payment details object  to variable
                    let paymentdetailsData = {
                        paymentDetails: paymentDetails,
                    }


                    console.log(paymentdetailsData, "45455455");
                    paymentdetailsData.paymentDetails.creditCardData.ccNumber = masked_card_number
                    paymentdetailsData.paymentDetails.customerId = customer_id
                    paymentdetailsData.createdOn = helpers.getCurrentDate();
                    let completionStaus = { 'completionStaus.paymentInfo': true }
                    // console.log(paymentdetailsData, "dddsdsd");
                    let userProfile = await updateSingleData(UserProfile, { ...paymentdetailsData, ...completionStaus }, { userId: result?.data?._id })


                    //update Payment details in user profile 
                    if (!userProfile.status) {
                        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
                    }

                    //add paytrace id in user collection
                    let addUserPaytraceId = await updateSingleData(Users, { payTraceId: Number(customer_id), updatedOn: helpers.getCurrentDate() }, { _id: result?.data?._id })

                    if (!addUserPaytraceId.status) {
                        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
                    }

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
                        let toUser = result?.data?.email
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

                }
                //ends payment details if 

                return helpers.showResponse(true, ResponseMessages?.users?.register_success, data, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.users?.register_error, null, null, 400);
        } catch (err) {
            console.log(err, "errorrr create user");
            return helpers.showResponse(false, ResponseMessages?.users?.register_error, err, null, 400);
        }

    },
    updateCustomer: async (data) => {
        try {
            let { firstName, lastName, billingAddress, paymentDetails, shippingAddress, payTraceId, userId } = data;

            let findUser = await getSingleData(Users, { _id: userId })
            if (!findUser.status) {
                return helpers.showResponse(false, ResponseMessages?.users.account_not_exist, null, null, 400);
            }

            let newObj = {
                updatedOn: helpers.getCurrentDate()
            }
            if (firstName) {
                newObj.firstName = firstName
            }
            if (lastName) {
                newObj.lastName = lastName
            }

            //if paytrace id exist then update user profile and paytrace is in user collection 
            if (payTraceId && !paymentDetails) {
                newObj.payTraceId = payTraceId
                await updateSingleData(UserProfile, { 'paymentDetails.customerId': payTraceId, updatedOn: helpers.getCurrentDate() }, { userId });
            }

            let result = await updateSingleData(Users, newObj, { _id: userId });

            if (billingAddress) {

                let obj = {
                    billingAddress: billingAddress,
                    'completionStaus.billingInfo': true,
                    updatedOn: helpers.getCurrentDate()
                }

                let userBillingAddress = await updateSingleData(UserProfile, obj, { userId: userId })

            }
            if (shippingAddress) {

                let obj = {
                    shippingAddress: shippingAddress,
                    'completionStaus.shippingInfo': true,
                    updatedOn: helpers.getCurrentDate()
                }

                let userShippingAddress = await updateSingleData(UserProfile, obj, { userId: userId })
            }

            if (paymentDetails) {

                const payTraceToken = await helpers.generatePayTraceToken();

                if (!payTraceToken.status) {
                    return helpers.showResponse(false, "PayTrace Token Not Generated", payTraceToken.data, null, 400)
                }


                let customerId

                if (payTraceId) {
                    console.log("under ifffe");

                    customerId = payTraceId
                } else {
                    console.log("under elseef");
                    //get total count of the users 
                    let count = await getCount(Users, { userType: 3 })
                    let idGenerated = helpers.generateIDs(count?.data)
                    // console.log(idGenerated, "id generateddd");
                    customerId = idGenerated.customerID
                }

                //paytrace ID Data
                const dataPaytrace = {
                    // customer_id: 77715522,
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
                if (payTraceId) {
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

                //retrieve paytrace id and mask card number
                let { customer_id, masked_card_number } = payTrace.data

                //assigning payment details object  to variable
                let paymentdetailsData = {
                    paymentDetails: paymentDetails,
                }


                console.log(paymentdetailsData, "45455455");
                paymentdetailsData.paymentDetails.creditCardData.ccNumber = masked_card_number
                paymentdetailsData.paymentDetails.customerId = customer_id
                paymentdetailsData.updatedOn = helpers.getCurrentDate();
                let completionStaus = { 'completionStaus.paymentInfo': true }
                // console.log(paymentdetailsData, "dddsdsd");
                let userProfile = await updateSingleData(UserProfile, { ...paymentdetailsData, ...completionStaus }, { userId: userId })


                //update Payment details in user profile 
                if (!userProfile.status) {
                    return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
                }

                //add paytrace id in user collection
                let addUserPaytraceId = await updateSingleData(Users, { payTraceId: Number(customer_id), updatedOn: helpers.getCurrentDate() }, { _id: userId })

                if (!addUserPaytraceId.status) {
                    return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
                }

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
                    let toUser = result?.data?.email
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
            }
            //ends payment details if 

            //if every thing is right response message of succesful updation
            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);

        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, err, null, 400);
        }

    },
    addSubAdmin: async (data,) => {
        try {
            let { firstName, lastName, email, password, access } = data;

            let checkSubAdmin = await getSingleData(Users, { email, userType: { $in: [1, 2] } })
            //if subadmin exist with status2 means delete then activate that admin as new subadmin
            if (checkSubAdmin.status) {

                if (checkSubAdmin.data.status == 2) {
                    let updateObj = {
                        firstName: firstName,
                        lastName: lastName,
                        password: md5(password),
                        access: access,
                        status: 3
                    }
                    let subAdmin = await updateSingleData(Users, updateObj, { email: email })
                    if (subAdmin.status) {
                        return helpers.showResponse(true, ResponseMessages?.admin.subAdmin_added, null, null, 200);

                    }
                    return helpers.showResponse(false, ResponseMessages?.admin.subAdmin_save_fail, null, null, 400);

                } else {
                    return helpers.showResponse(false, ResponseMessages?.admin.email_already, null, null, 400);
                }

                // return helpers.showResponse(false, ResponseMessages?.admin.email_already, null, null, 400);
            } else {

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

            }

        } catch (err) {
            return helpers.showResponse(false, ResponseMessages?.admin.subAdmin_save_fail, err, null, 400);
        }

    },

    getAllSubAdmins: async (data) => {
        try {
            let { sortColumn = 'createdOn', sortDirection = 'asc', pageIndex = 1, pageSize = 10, searchKey = '', subAdminId } = data
            pageIndex = Number(pageIndex)
            pageSize = Number(pageSize)

            let matchObj = {
                email: { $regex: searchKey, $options: 'i' },
                userType: 2,
                status: { $ne: 2 }
            }

            if (subAdminId) {
                matchObj._id = mongoose.Types.ObjectId(subAdminId)
            }


            let aggregate = [
                {
                    $match: {
                        $or: [
                            { ...matchObj }

                        ]
                    }
                },

                {
                    $sort: {
                        [sortColumn]: sortDirection == 'asc' ? 1 : -1
                    }
                },

            ]


            //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
            let { totalCount, aggregation } = await helpers.getCountAndPagination(Users, aggregate, pageIndex, pageSize)
            console.log(totalCount, "totalCounttotalCount");

            const result = await Users.aggregate(aggregation)



            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { items: result, totalCount }, null, 200);
        } catch (err) {
            console.log(err, "err get side");
            return helpers.showResponse(false, ResponseMessages?.common.database_error, err, null, 400);
        }

    },
    activeInactiveUser: async (data) => {
        try {
            let { status, userId } = data
            status = Number(status)

            let find = await getSingleData(Users, { _id: userId })

            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages.users.account_not_exist, null, null, 400);
            }

            if (status == 1) { //1 for activate 

                let findUser = await getSingleData(UserProfile, { userId: userId })

                if (!findUser.status) {
                    return helpers.showResponse(false, ResponseMessages.users.account_not_exist, null, null, 400);
                }

                console.log(findUser.data, "userData");

                let basicInfo = findUser?.data?.completionStaus?.basicInfo
                let billingInfo = findUser?.data?.completionStaus?.billingInfo
                let paymentInfo = findUser?.data?.completionStaus?.paymentInfo
                let shippingInfo = findUser?.data?.completionStaus?.shippingInfo


                if (!basicInfo) {
                    return helpers.showResponse(false, ResponseMessages?.users.basic_info_not_available, null, null, 400);
                }
                if (!billingInfo) {
                    return helpers.showResponse(false, ResponseMessages?.users.billing_info_not_available, null, null, 400);
                }
                if (!paymentInfo) {
                    return helpers.showResponse(false, ResponseMessages?.users.payment_info_not_available, null, null, 400);
                }
                if (!shippingInfo) {
                    return helpers.showResponse(false, ResponseMessages?.users.shipping_info_not_available, null, null, 400);
                }


            }


            let result = await updateSingleData(Users, { status }, { _id: userId })
            if (result.status) {
                //after updated status send email to user 

                if (status == 4 || status == 1) {


                    const logoPath = path.join(__dirname, '../views', 'logo.png');
                    let updateMessage = status == 1 ? "Account Activated" : "Account Deactivated"
                    let template = status == 1 ? "ActivateUser.ejs" : "DeactivateUser.ejs"
                    let userName = find?.data?.firstName + ' ' + find?.data?.lastName

                    let to = find?.data?.email
                    let subject = updateMessage
                    let attachments = [

                        {
                            filename: 'logo.png',
                            path: logoPath,
                            cid: 'unique@mwwLogo',
                        }
                    ]


                    const html = await ejs.renderFile(path.join(__dirname, '../views', template), { user: userName, cidLogo: 'unique@mwwLogo' });

                    let email = await helpers.sendEmailService(to, subject, html, attachments)

                }



                return helpers.showResponse(true, ResponseMessages?.common.update_sucess, null, null, 200);
            }

        } catch (err) {
            console.log(err, "errrrrrrr");
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

            let updateObj = {}

            if (firstName) {
                updateObj.firstName = firstName
            }
            if (lastName) {
                updateObj.lastName = lastName
            }
            if (access) {
                updateObj.access = access
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
                return helpers.showResponse(true, status ? "Deleted Successfully" : ResponseMessages?.common.update_sucess, null, null, 200);
            }
            return helpers.showResponse(false, status ? "Error While Deleting " : ResponseMessages?.common.update_failed, err, null, 400);

        } catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }

    },
    saveNotification: async (data) => {
        try {
            const { type, title, userIds, description } = data

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

            aggregationPipeline.push(
                {
                    $skip: (pageIndex - 1) * pageSize // Skip records based on the page number
                },
                {
                    $limit: pageSize // Limit the number of records per page
                },
            )
            let totalCount = await getCount(Notification, matchObj)
            const result = await Notification.aggregate(aggregationPipeline)

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