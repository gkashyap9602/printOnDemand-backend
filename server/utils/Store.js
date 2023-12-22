require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const ProductLibrary = require('../models/ProductLibrary');
const ProductLibraryVarient = require("../models/ProductLibraryVarient");
const { default: axios } = require('axios');
const consts = require('../constants/const');
const UserProfile = require('../models/UserProfile');
const Store = require('../models/Store')

const store = {

    saveShopInfo: async (data, userId) => {

        let { apiKey, shop, secret, storeVersion } = data
        //add current static version of shopify
        storeVersion = "2023-10"
        console.log(data, "dataaaa");

        let storeId = "https://" + shop + "/";
        let storeUrl = "https://" + shop + "/";
        let storeName = shop.split(".")[0];

        console.log(subdomain);
        let newObj = {
            apiKey,
            shop,
            secret,
            storeVersion,
            storeId: storeId,
            storeUrl: storeUrl,
            storeName: storeName,
            storeType: 1,//1 for shopify
            status: 1,
            createdOn: helpers.getCurrentDate(),

        }

        let storeRef = new Store(newObj)
        let result = await postData(storeRef);

        // console.log(result,"resulttt");
        if (result.status) {

            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },
    updateStoreDetails: async (data, userId) => {

        let { apiKey, shop, secret, storeVersion } = data

        //add current static version of shopify
        storeVersion = "2023-10"

        // secret = "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"
        // shop = "@sunil-mww"
        // apiKey = "f479e5e97f4ab23bde3f74df1c21e23a"

        console.log(data, "dataaaa");
        let updateData = {
            updatedOn: helpers.getCurrentDate(),
            storeDetails: {
                apiKey: apiKey,
                shop: shop,
                secret: secret,
                storeVersion: storeVersion
            }
        }

        let result = await updateSingleData(UserProfile, updateData, { userId: userId })
        // console.log(result,"resulttt");
        if (result.status) {
            await updateSingleData(Users, { isLoginFromShopify: true }, { _id: userId })

            return helpers.showResponse(true, ResponseMessages?.users?.user_account_updated, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.users?.user_account_update_error, null, null, 400);
    },
    addProductToShopify: async (data, userId) => {
        try {
            let { productLibraryItems, storeId } = data
            console.log(data, "dataaa");
            console.log(userId, "userId");

            let userProfileData = await getSingleData(UserProfile, { userId }, 'storeDetails')

            if (!userProfileData.status) {
                return helpers.showResponse(false, ResponseMessages?.users?.account_not_exist, null, null, 400);
            }
            console.log(userProfileData, "userProfileData");
            let { apiKey, shop, secret, storeVersion } = userProfileData?.data?.storeDetails

            let endPointData = {
                apiKey,
                shop,
                secret,
                storeVersion
            }

            let productLibraryIds = productLibraryItems?.map(({ productLibraryId }) => mongoose.Types.ObjectId(productLibraryId))

            let matchObj = {
                userId: mongoose.Types.ObjectId(userId),
                status: { $ne: 2 },
                _id: { $in: productLibraryIds },

            }
            console.log(matchObj, "matchObjj");

            //aggregate on ProductLibrary collection
            let result = await ProductLibrary.aggregate([
                {
                    $match: {
                        ...matchObj
                    }
                },
                {
                    $lookup: {
                        from: 'productLibraryVarient',
                        localField: '_id',
                        foreignField: 'productLibraryId',
                        as: 'varientData',

                    }
                },
                {
                    $lookup: {
                        from: 'productVarient',
                        localField: 'varientData.productVarientId',
                        foreignField: '_id',
                        as: 'productVarientData',
                        pipeline: [
                            {
                                $match: {
                                    status: { $ne: 2 }
                                }
                            },

                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'variableOptions',
                        localField: 'productVarientData.varientOptions.variableOptionId',
                        foreignField: '_id',
                        as: 'variableOptionData',
                    }
                },
                {
                    $addFields: {
                        priceStartsFrom: { $min: "$varientData.price" }
                    }
                },


            ])

            console.log(result, "resulttt=====");


            let productData = {
                title: "Testing",
                body_html: "<strong>mww Test!</strong>",
                vendor: "Burton",
                product_type: "Snowboard",
                status: "draft"
            }

            let addToStoreApi = await helpers.addToStoreShopify(endPointData, productData)

            // console.log(addToStoreApi, "addToStoreApi");

            if (!addToStoreApi.status) {
                return helpers.showResponse(false, addToStoreApi.data, addToStoreApi.message, null, 400)
            }

            return helpers.showResponse(false, ResponseMessages?.product.add_to_store_fail, null, null, 400);

            // return helpers.showResponse(true, ResponseMessages?.product.add_to_store_sucess, {}, null, 200);
        }
        catch (err) {
            // console.log(err, "errorrr");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    // getProductShopify: async (data, userId) => {
    //     try {
    //         let { productLibraryItems, storeId } = data
    //         console.log(data, "dataaa");
    //         console.log(userId, "userId");

    //         let userProfileData = await getSingleData(UserProfile, { userId }, 'storeDetails')

    //         if (!userProfileData.status) {
    //             return helpers.showResponse(false, ResponseMessages?.users?.account_not_exist, null, null, 400);
    //         }
    //         console.log(userProfileData, "userProfileData");
    //         let { apiKey, shop, secret, storeVersion } = userProfileData?.data?.storeDetails

    //         let endPointData = {
    //             apiKey,
    //             shop,
    //             secret,
    //             storeVersion
    //         }

    //         let productLibraryIds = productLibraryItems?.map(({ productLibraryId }) => mongoose.Types.ObjectId(productLibraryId))

    //         let matchObj = {
    //             userId: mongoose.Types.ObjectId(userId),
    //             status: { $ne: 2 },
    //             _id: { $in: productLibraryIds },

    //         }
    //         console.log(matchObj, "matchObjj");

    //         //aggregate on ProductLibrary collection
    //         let result = await ProductLibrary.aggregate([
    //             {
    //                 $match: {
    //                     ...matchObj
    //                 }
    //             },
    //             // {
    //             //     $lookup: {
    //             //         from: 'productLibraryVarient',
    //             //         localField: '_id',
    //             //         foreignField: 'productLibraryId',
    //             //         as: 'varientData',

    //             //     }
    //             // },
    //             // {
    //             //     $lookup: {
    //             //         from: 'productVarient',
    //             //         localField: 'varientData.productVarientId',
    //             //         foreignField: '_id',
    //             //         as: 'productVarientData',
    //             //         pipeline: [
    //             //             {
    //             //                 $match: {
    //             //                     status: { $ne: 2 }
    //             //                 }
    //             //             },

    //             //         ]
    //             //     }
    //             // },
    //             // {
    //             //     $lookup: {
    //             //         from: 'variableOptions',
    //             //         localField: 'productVarientData.varientOptions.variableOptionId',
    //             //         foreignField: '_id',
    //             //         as: 'variableOptionData',
    //             //     }
    //             // },
    //             // {
    //             //     $addFields: {
    //             //         priceStartsFrom: { $min: "$varientData.price" }
    //             //     }
    //             // },


    //         ])

    //         console.log(result, "resulttt=====");


    //         let productData = {
    //             title: "Testing",
    //             body_html: "<strong>mww Test!</strong>",
    //             vendor: "Burton",
    //             product_type: "Snowboard",
    //             status: "draft"
    //         }

    //         let addToStoreApi = await helpers.addToStoreShopify(endPointData, productData)

    //         // console.log(addToStoreApi, "addToStoreApi");

    //         if (!addToStoreApi.status) {
    //             return helpers.showResponse(false, addToStoreApi.data, addToStoreApi.message, null, 400)
    //         }

    //         return helpers.showResponse(false, ResponseMessages?.product.add_to_store_fail, null, null, 400);

    //         // return helpers.showResponse(true, ResponseMessages?.product.add_to_store_sucess, {}, null, 200);
    //     }
    //     catch (err) {
    //         // console.log(err, "errorrr");
    //         return helpers.showResponse(false, err?.message, null, null, 400);
    //     }
    // },


}

module.exports = {
    ...store
}