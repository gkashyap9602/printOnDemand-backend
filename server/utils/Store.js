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
                        from: 'product',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productData',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'subCategory',
                                    localField: 'subCategoryId',
                                    foreignField: '_id',
                                    as: 'subCategoryData',
                                    pipeline: [
                                        // {
                                        //     $match: {
                                        //         status: { $ne: 2 }
                                        //     }

                                        // },
                                        {
                                            $project: {
                                                _id: 1,
                                                name: 1
                                            }
                                        }
                                    ]

                                }
                            },
                            // {
                            //     $lookup: {
                            //         from: 'category',
                            //         localField: 'subCategoryData.categoryId',
                            //         foreignField: '_id',
                            //         as: 'categoryData',

                            //     }
                            // },
                            {
                                $unwind: "$subCategoryData"
                            },
                            {
                                $project: {
                                    subCategoryData: 1,
                                }
                            }
                        ]

                    }
                },
                {
                    $unwind: "$productData" //product is single document

                },
                //we add lookup for product library varient because it has product varient id for lookup 
                {
                    $lookup: {
                        from: 'productLibraryVarient',
                        localField: '_id',
                        foreignField: 'productLibraryId',
                        as: 'varientData', //it canbe multiple items
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'productVarient',
                                    localField: 'productVarientId',
                                    foreignField: '_id',
                                    as: 'productVarientData', //product vaarient data should be single document because we are fetching one item with id 
                                    pipeline: [
                                        // {
                                        //     $match: {
                                        //         status: { $ne: 2 }
                                        //     }
                                        // },
                                        {
                                            $lookup: {
                                                from: 'variableOptions',
                                                localField: 'varientOptions.variableOptionId',
                                                foreignField: '_id',
                                                as: 'variableOptionData',// it should be array of objects because it canbe multiple
                                                pipeline: [
                                                    {
                                                        $lookup: {
                                                            from: 'variableTypes',
                                                            localField: 'variableTypeId',
                                                            foreignField: '_id',
                                                            as: 'variableTypesData',

                                                        }
                                                    },
                                                    {
                                                        $unwind: {
                                                            path: "$variableTypesData"
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            _id: 1,
                                                            value: 1,
                                                            variableTypeId: 1,
                                                            typeName: '$variableTypesData.typeName'

                                                        }

                                                    }

                                                ]
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                productId: 1,
                                                price: 1,
                                                productCode: 1,
                                                // varientOptions: 1,
                                                variableOptionData: 1
                                            }
                                        }

                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$productVarientData"
                                }
                            },
                            //here we create varient data and options for product add in shopify
                            {
                                $addFields: {
                                    variant: {
                                        ['option1']: "$productVarientData.variableOptionData.value",
                                        price: "$price",
                                        sku: "$productVarientData.productCode"
                                    },
                                    options: {
                                        name: "$productVarientData.variableOptionData.typeName",
                                        position: 1
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    productLibraryId: 1,
                                    productVarientId: 1,
                                    price: 1,
                                    profit: 1,
                                    //    productLibraryVarientImages:1,
                                    status: 1,
                                    productVarientData: 1,
                                    variant: 1,
                                    options: 1


                                }
                            }
                        ]

                    }
                },

                // {
                //     $addFields: {
                //         variantData: {
                //             options1: "",
                //             price: "",
                //             sku: "",
                //         },
                //         options: {
                //             name: "",
                //             values: []
                //         }
                //     }
                // },
                {
                    $project: {
                        _id: 1,
                        productId: 1,
                        title: 1,
                        description: 1,
                        status: 1,
                        addToStore: 1,
                        productLibraryImages: 1,
                        productData: 1,
                        varientData: 1,
                        // variant: 1,
                        // options: 1
                    }
                }


            ])
            //ends of aggregation


            let libData = result[0]

            console.log(libData, "libData");


            let varientData = libData?.varientData?.map((itm, index) => {
                let newObj = {

                    option1: libData?.title + index, //varient title name
                    price: itm?.price, //varient price
                    sku: "" //product code 

                }
                return newObj
            })


            console.log(varientData, "varientDataaa");

            let productImages = libData?.productLibraryImages?.map((itm) => {
                return {
                    src: `${consts.BITBUCKET_URL_DEV}/${itm.imageUrl}`
                }
            })




            let productData = {
                product: {
                    title: libData.title,
                    body_html: `<strong>${libData?.description}</strong>`,
                    vendor: "BurtonGk",
                    product_type: libData?.productData?.categoryData?.name,
                    status: "active",
                    images: productImages,
                    // variants: varientData[0],
                    options: [
                        {
                            // "id": 11307358847298,
                            // "product_id": 9007266758978,
                            "name": "Size",
                            "position": 1,
                            // "values": [
                            //     "XL", "M"
                            // ]
                        }
                    ],
                    variants: [
                        {
                            "option1": "XL",
                            "price": "25.99",
                            "sku": "PP85123",
                            "inventory_quantity": 50,
                        },
                    ]

                }

            }

            // let addToStoreApi = await helpers.addProductToShopify(endPointData, productData)

            //if product add then add varient
            // if (addToStoreApi.status) {

            //     // let productId = addToStoreApi?.data?.product?.id

            //     // let varientData = libData?.varientData?.map((itm, index) => {
            //     //     console.log(itm, "===================itm")

            //     //     let newObj = {
            //     //         variant: {
            //     //             price: itm?.price,
            //     //             option1: "Yellow",
            //     //         }
            //     //     }

            //     //     return newObj
            //     // })

            //     //add varient api 
            //     // let addVarientApi = await helpers.addProductVarientToShopify(endPointData, varientData, productId)

            //     // //if success then return 
            //     // if (addVarientApi.status) {

            //     //     return helpers.showResponse(true, addToStoreApi.message, addToStoreApi.data, null, 200)
            //     // } else {

            //     //     return helpers.showResponse(false, "errr varient", {}, null, 400);

            //     // }


            //     return helpers.showResponse(true, addToStoreApi.message, addToStoreApi.data, null, 200)
            // }
            // return helpers.showResponse(false, addToStoreApi.data, addToStoreApi.message ? productData : ResponseMessages?.product.add_to_store_fail, null, 400);
            return helpers.showResponse(false, "dataa", result[0], null, 400);
            // result.length > 0 ? result[0] : result
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