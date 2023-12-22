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


        let findStore = await getSingleData(Store, { shop: shop, userId: userId })

        if (findStore.status) {
            return helpers.showResponse(false, ResponseMessages?.store.store_already, null, null, 400);
        }
        let storeId = "https://" + shop + "/";
        let storeUrl = "https://" + shop + "/";
        let storeName = shop.split(".")[0];

        let newObj = {
            userId, userId,//as a reference
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

            return helpers.showResponse(true, ResponseMessages?.store.save_shop_info_success, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.store.save_shop_info_fail, null, null, 400);
    },
    getAllStores: async (data) => {
        let { userId, storeType, status } = data
        //add current static version of shopify


        let matchObj = {
            userId: mongoose.Types.ObjectId(userId),
            // storeType: storeType,
        }

        if (status) {
            matchObj.status = Number(status)
        }

        console.log(userId, "useriddd");
        let result = await Store.aggregate([
            {
                $match: {
                    ...matchObj
                }
            }
        ])

        console.log(result, "resulttt");

        // if (result.status) {
        //     return helpers.showResponse(true, ResponseMessages?.store.save_shop_info_success, {}, null, 200);
        // }
        return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result.length > 0 ? result : result, null, 200);
    },
    updateStoreStatus: async (data, userId) => {

        let { storeId, status } = data

        console.log(data, "dataaaa");

        let updateData = {
            updatedOn: helpers.getCurrentDate(),
            status: Number(status)
        }
        let result = await updateSingleData(Store, updateData, { _id: storeId, userId: userId })
        console.log(result, "resulttt");
        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.store.store_status_update, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.store.store_update_fail, null, null, 400);
    },
    removeStore: async (data, userId) => {

        let { storeId } = data
        console.log(storeId, "storeId");

        let result = await deleteById(Store, storeId)
        console.log(result, "resulttt");
        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.store.store_delete_success, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.store.store_delete_fail, null, null, 400);
    },
    addProductToShopify: async (data, userId) => {
        try {
            let { productLibraryItems, storeId } = data
            console.log(data, "dataaa");

            let findStore = await getSingleData(Store, { _id: storeId, userId: userId })

            if (!findStore.status) {
                return helpers.showResponse(false, ResponseMessages?.store.store_not_exist, null, null, 400);
            }

            console.log(findStore, "findStore");
            let { apiKey, shop, secret, storeVersion } = findStore?.data

            let endPointData = {
                apiKey,
                shop,
                secret,
                storeVersion
            }

            let productLibraryIds = productLibraryItems?.map(({ productLibraryId }) => mongoose.Types.ObjectId(productLibraryId))

            //check all product library exist or not 
            const findProductLibraryIds = await getDataArray(ProductLibrary, { _id: { $in: productLibraryIds }, status: { $ne: 2 } })

            if (findProductLibraryIds?.data?.length !== productLibraryIds?.length) {
                return helpers.showResponse(false, ResponseMessages?.product.invalid_product_library_id, {}, null, 400);
            }

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