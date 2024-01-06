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
const ProductQueue = require('../models/ProductQueue')

const store = {

    saveShopInfo: async (data, userId) => {

        let { apiKey, shop, secret, storeVersion } = data
        //add current static version of shopify
        storeVersion = "2023-10"
        console.log(data, "dataaaa");


        let findStore = await getSingleData(Store, { shop: shop, userId: userId, status: { $ne: 3 } })

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
            status: { $ne: 3 } //3 for soft delete 
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

        let findStore = await getSingleData(Store, { _id: storeId, userId, status: { $ne: 3 } })

        if (!findStore.status) {
            return helpers.showResponse(false, ResponseMessages?.store.store_not_exist, null, null, 203);
        }

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
    removeStore: async (data) => {

        let { storeId } = data
        console.log(storeId, "storeId");

        let result = await updateSingleData(Store, { status: 3 }, { _id: storeId, status: { $ne: 3 } })
        console.log(result, "resulttt");
        if (result.status) {
            return helpers.showResponse(true, ResponseMessages?.store.store_delete_success, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.store.store_delete_fail, null, null, 400);
    },

    getPushProductsToStore: async (data, userId) => {
        try {
            let { pageSize = 10, pageIndex = 1, sortDirection = "asc", sortColumn = "uploadDate", storeIds = [],
                searchKey = '', status, isFromShop, createdFrom, createdTill } = data;

            pageSize = Number(pageSize)
            pageIndex = Number(pageIndex)


            let matchObj = {
                userId: mongoose.Types.ObjectId(userId),

            }

            if (status) {
                matchObj.status = Number(status)

            }
            if (createdFrom && createdTill) {
                matchObj.createdOn = { $gte: createdFrom, $lte: createdTill }
            }
            if (storeIds?.length > 0) {
                storeIds = storeIds.map((id) => mongoose.Types.ObjectId(id))
                matchObj.storeId = { $in: storeIds }
            }

            console.log(matchObj, "matchObj");

            let aggregate = [
                {
                    $match: {
                        ...matchObj,

                    }
                },
                {
                    $lookup: {
                        from: "productLibrary",
                        localField: "productLibraryId",
                        foreignField: "_id",
                        as: "ProductLibraryData",
                        pipeline: [
                            // {
                            //     $match: {
                            //         status: { $ne: 2 }
                            //     }
                            // },
                            {
                                $project: {
                                    _id: 1,
                                    productId: 1,
                                    title: 1,
                                    description: 1,
                                    status: 1
                                }
                            }
                        ]

                    }
                },
                {
                    $lookup: {
                        from: "store",
                        localField: "storeId",
                        foreignField: "_id",
                        as: "storeData",
                        pipeline: [
                            {
                                $match: {
                                    status: { $ne: 3 } //check if store not deleted
                                }
                            },

                        ]

                    }
                },
                {
                    $unwind: {
                        path: "$storeData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: "$ProductLibraryData"
                },
                {
                    $match: {
                        "ProductLibraryData.title": { $regex: searchKey, $options: 'i' },
                    }
                },

                {
                    $sort: {
                        [sortColumn]: sortDirection === "asc" ? 1 : -1
                    }
                },

                {
                    $project: {
                        _id: 1,
                        productLibraryTitle: "$ProductLibraryData.title",
                        pushStatus: "$status",
                        storeName: "$storeData.storeName",
                        shop: "$storeData.shop",
                        uploadDate: "$uploadDate",
                        createdOn: "$createdOn"
                    }
                }

            ]

            //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
            let { totalCount, aggregation } = await helpers.getCountAndPagination(ProductQueue, aggregate, pageIndex, pageSize)
            console.log(totalCount, "totalCounttotalCount");

            let completed = await getCount(ProductQueue, { status: 1 })
            let failed = await getCount(ProductQueue, { status: 3 })
            let processing = await getCount(ProductQueue, { status: 2 })
            let total = await getCount(ProductQueue, {})


            let statusSummary = {
                completed: completed?.data,
                failed: failed?.data,
                processing: processing?.data,
                totalUploads: total?.data
            }

            const result = await ProductQueue.aggregate(aggregation);

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { items: result, totalCount, statusSummary }, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    addProductToStore: async (data, userId) => {
        try {
            let { productLibraryItems, storeId } = data
            console.log(data, "dataaa");

            //create a product queue
            const productQueue = helpers.generateQueue('productQueue')

            let isPartialPush = false //key for add product partially if some products already exists

            let findStore = await getSingleData(Store, { _id: storeId, userId: userId, status: { $ne: 3 } })

            if (!findStore.status) {
                return helpers.showResponse(false, ResponseMessages?.store.store_not_exist, null, null, 400);
            }

            //ids that is get by payload from frontend
            let productLibraryIds = productLibraryItems?.map(({ productLibraryId }) => mongoose.Types.ObjectId(productLibraryId))

            //check all product library exist or not 
            const findProductLibraryIds = await getDataArray(ProductLibrary, { _id: { $in: productLibraryIds }, status: { $ne: 2 } })

            console.log(findProductLibraryIds, "ddddd");
            console.log(productLibraryIds, "ffff");

            if (findProductLibraryIds?.data?.length !== productLibraryIds?.length) {
                return helpers.showResponse(false, `${ResponseMessages?.product.invalid_product_library_id} or one or more product has been deleted`, {}, null, 400);
            }

            //lets find all product that is exist in queue
            let findQueue = await getDataArray(ProductQueue, { userId, storeId, productLibraryId: { $in: productLibraryIds } }, 'productLibraryId')


            // let findQueueFilter = findQueue.data.filter((itm) => itm.productLibraryId)

            console.log(findQueue, "findQueeuee");

            //if products exist in queue atleast 1 document  
            if (findQueue?.status && findQueue?.data?.length > 0) {

                //check if exist product in queue and current product ids length not same then its partially push to queue 
                if (findQueue?.data?.length !== productLibraryIds?.length) {

                    //let found the ids the is present in queue
                    const foundIds = findQueue?.data?.map(doc => doc?.productLibraryId.toString()); // Convert to strings

                    console.log(foundIds, "foundIdsss");
                    console.log(productLibraryIds, "productLibraryIds==");

                    //let assign rest of productLibraryIds that is not present in the queue and ready to go in a queue 
                    productLibraryIds = productLibraryIds?.filter(id => !foundIds?.includes(id.toString())); // Convert to strings
                    console.log(productLibraryIds, "notFound productLibraryIds");

                    //set partial equal to true rest of ids or products will be addedd to queue
                    isPartialPush = true
                } else {
                    return helpers.showResponse(false, "Products are Already Added To Queue", null, null, 400);
                }

            }
            //ends

            console.log(productLibraryIds, "productLibraryIds after ");


            // console.log(findStore, "findStore");
            let { apiKey, shop, secret, storeName } = findStore?.data

            //pass data to queue
            let endPointData = {
                apiKey,
                shop,
                secret,
                // storeVersion,
                // _id,
                // storeName,
                // storeType
            }


            let matchObj = {
                userId: mongoose.Types.ObjectId(userId),
                status: { $ne: 2 },
                _id: { $in: productLibraryIds }, //match productsLibrary ids that is not present in the queue

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
                        as: 'varientData', //it canbe multiple items product has multiple variants
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
                                                // price: 1,
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
                                        option1: {
                                            $reduce: {
                                                input: "$productVarientData.variableOptionData",
                                                initialValue: "",
                                                in: {
                                                    $concat: [
                                                        "$$value",
                                                        { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
                                                        "$$this.value"
                                                    ]
                                                }
                                            }
                                        },
                                        price: "$price",
                                        sku: "$productVarientData.productCode"
                                    },
                                    options: {
                                        name: {
                                            $reduce: {
                                                input: "$productVarientData.variableOptionData",
                                                initialValue: "",
                                                in: {
                                                    $concat: [
                                                        "$$value",
                                                        { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
                                                        "$$this.typeName"
                                                    ]
                                                }
                                            }
                                        },
                                        position: 1
                                    }
                                }
                            },
                            //in varient data only project Variant Data And Options
                            {
                                $project: {
                                    _id: 1,
                                    productLibraryId: 1,
                                    productVarientId: 1,
                                    price: 1,
                                    profit: 1,
                                    //    productLibraryVarientImages:1,
                                    status: 1,
                                    // productVarientData: 1,
                                    variant: 1,
                                    options: 1


                                }
                            }
                        ]

                    }
                },
                //find unique name and return it for shopify payload
                {
                    $addFields: {
                        optionsForVarient: {
                            $map: {
                                input: { $setUnion: "$varientData.options.name" },
                                as: "name",
                                in: { name: "$$name" }
                            }
                        },
                        productLibraryImages: {
                            $map: {
                                input: "$productLibraryImages",
                                as: "image",
                                in: { src: { $concat: [consts.BITBUCKET_URL_DEV, "/", "$$image.imageUrl"] } }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        productId: 1,
                        title: 1,
                        description: 1,
                        status: 1,
                        addToStore: 1,
                        productLibraryImages: 1,
                        subCategoryName: "$productData.subCategoryData.name",
                        // productData: 1,
                        // varientData: 1, //variants canbe multiple 
                        optionsForVarient: 1,
                        variantDataForShopify: "$varientData.variant" // One Product Has Multiple variant
                    }
                }

            ])
            //ends of aggregation

            //Add all products to queue and return promise 
            let addToQueuePromises = result?.map((product, index) => {

                //Shopify product payload 
                let productData = {
                    product: {
                        title: product?.title,
                        body_html: `<strong>${product?.description}</strong>`,
                        vendor: storeName,
                        product_type: product?.subCategoryName,
                        status: "draft", //default status of a product is draft 
                        images: product?.productLibraryImages,
                        options: product?.optionsForVarient,
                        variants: product?.variantDataForShopify
                    }

                }
                // ends 

                //add all productLibrary Products in a Products Queue for further operations with important arguments
                let addToQueue = productQueue.add({ productData, endPointData, productLibraryId: product._id, userId, storeId },
                    {
                        delay: 60000, //queue process after 3 minutes delay 
                        attempts: 1, //execute only one time
                        removeOnComplete: true //remove queue  after complete 
                    })
                    .then((res) => {
                        // console.log(res, "888responsee");
                        return { success: true, message: "All Products Added To Queue" };
                    })
                    .catch((err) => {
                        // console.log(err, "error");
                        return { success: false, message: "Error While Products Adding To Queue" };

                    })

                return addToQueue

            })
            //ends

            const responses = await Promise.all(addToQueuePromises);//resolve promise

            // Check if all responses are successful
            const allSuccessfull = responses.every(response => response.success);

            if (allSuccessfull) {

                //create queue data payload for queue collection model to save queue
                let items = productLibraryIds?.map((productLibraryId) => {
                    let obj = {
                        userId,
                        storeId,
                        // storeDetails: {
                        //     storeName: storeName,
                        //     shop: shop,
                        // },

                        productLibraryId,
                        pushedDate: helpers.getCurrentDate(),
                        createdOn: helpers.getCurrentDate()
                    }

                    return obj

                })
                let insertQueue = await insertMany(ProductQueue, items)
                // console.log(insertQueue, "insertQueue");

                //if items insert in queue model successfully then return  success response
                if (insertQueue.status) {
                    return helpers.showResponse(true, ResponseMessages.product.add_to_store_sucess, { isPartialPush }, null, 200);
                }

                return helpers.showResponse(false, ResponseMessages.product.add_to_store_fail, {}, null, 400);
            } else {
                return helpers.showResponse(false, ResponseMessages.product.add_to_store_fail, {}, null, 400);
            }

        }
        catch (err) {
            // console.log(err, "errorrr");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },

    retryPushProductToStore: async (data, userId) => {
        try {
            let { pushProductQueueIds } = data
            console.log(data, "dataaa");

            //create a product queue
            const productQueue = helpers.generateQueue('productQueue')

            //check all product library exist or not 
            const findPushProducts = await getDataArray(ProductQueue, { _id: { $in: pushProductQueueIds } })

            console.log(findPushProducts, "findPushProducts");
            let allPushStatusFail = findPushProducts?.data?.every(data => data?.status == 3) //3 for failed status

            console.log(allPushStatusFail, "allPushStatusFail");
            if (!allPushStatusFail) {
                return helpers.showResponse(false, ResponseMessages.product.push_status_should_be_failed, null, null, 400);
            }

            if (findPushProducts?.data?.length !== pushProductQueueIds?.length) {
                return helpers.showResponse(false, `${ResponseMessages?.product.invalid_productQueue_id}`, {}, null, 400);
            }

            let productLibraryIds = findPushProducts.data.map(({ productLibraryId }) => productLibraryId)
            let storeIds = findPushProducts.data.map(({ storeId }) => storeId)

            //check all product library exist or not 
            const findProductLibraryIds = await getDataArray(ProductLibrary, { _id: { $in: productLibraryIds }, status: { $ne: 2 } })

            console.log(findProductLibraryIds, "findProductLibraryIds");

            if (findProductLibraryIds?.data?.length !== productLibraryIds?.length) {
                return helpers.showResponse(false, "Invalid Product Id or one or more Product Has been Deleted", {}, null, 400);
            }

            // let isPartialPush = false

            let findStoreIds = await getDataArray(Store, { _id: { $in: storeIds }, userId: userId })
            console.log(findStoreIds, "findStoreIds");

            if (!findStoreIds.status) {
                return helpers.showResponse(false, "Store Not Exist or Deleted", null, null, 400);
            }

            console.log(productLibraryIds, "productLibraryIds after ");



            let matchObj = {
                userId: mongoose.Types.ObjectId(userId),
                status: { $ne: 2 },
                _id: { $in: productLibraryIds }, //match productsLibrary ids that is not present in the queue

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
                        as: 'varientData', //it canbe multiple items product has multiple variants
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
                                                // price: 1,
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
                                        option1: {
                                            $reduce: {
                                                input: "$productVarientData.variableOptionData",
                                                initialValue: "",
                                                in: {
                                                    $concat: [
                                                        "$$value",
                                                        { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
                                                        "$$this.value"
                                                    ]
                                                }
                                            }
                                        },
                                        price: "$price",
                                        sku: "$productVarientData.productCode"
                                    },
                                    options: {
                                        name: {
                                            $reduce: {
                                                input: "$productVarientData.variableOptionData",
                                                initialValue: "",
                                                in: {
                                                    $concat: [
                                                        "$$value",
                                                        { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
                                                        "$$this.typeName"
                                                    ]
                                                }
                                            }
                                        },
                                        position: 1
                                    }
                                }
                            },
                            //in varient data only project Variant Data And Options
                            {
                                $project: {
                                    _id: 1,
                                    productLibraryId: 1,
                                    productVarientId: 1,
                                    price: 1,
                                    profit: 1,
                                    //    productLibraryVarientImages:1,
                                    status: 1,
                                    // productVarientData: 1,
                                    variant: 1,
                                    options: 1


                                }
                            }
                        ]

                    }
                },
                //find unique name and return it for shopify payload
                {
                    $addFields: {
                        optionsForVarient: {
                            $map: {
                                input: { $setUnion: "$varientData.options.name" },
                                as: "name",
                                in: { name: "$$name" }
                            }
                        },
                        productLibraryImages: {
                            $map: {
                                input: "$productLibraryImages",
                                as: "image",
                                in: { src: { $concat: [consts.BITBUCKET_URL_DEV, "/", "$$image.imageUrl"] } }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        productId: 1,
                        title: 1,
                        description: 1,
                        status: 1,
                        addToStore: 1,
                        productLibraryImages: 1,
                        subCategoryName: "$productData.subCategoryData.name",
                        // productData: 1,
                        // varientData: 1, //variants canbe multiple 
                        optionsForVarient: 1,
                        variantDataForShopify: "$varientData.variant" // One Product Has Multiple variant
                    }
                }

            ])
            //ends of aggregation

            //Add all products to queue and return promise 
            let addToQueuePromises = result?.map((product, index) => {

                //get single push product from all document with match product library id 
                console.log(product._id, "productid");
                let pushProduct = findPushProducts.data?.filter(({ productLibraryId }) => productLibraryId.toString() == product._id.toString())

                console.log(pushProduct[0], "pushProduct");

                //after finding push product get unique shopName to get store api key and other details 
                let shopName = pushProduct[0]?.storeDetails?.shop

                console.log(shopName, "shopName");

                //filter store data and get particuler store details like apikey shop name etc 
                let storeData = findStoreIds?.data?.filter(({ shop }) => shop == shopName)

                console.log(storeData, "storeData");

                //retrieve important feilds from shop or store to pass in a endpoint of queue shopify api 
                let { apiKey, shop, secret, storeVersion, storeName, _id, storeType } = storeData[0]

                //pass data to queue
                let endPointData = {
                    apiKey,
                    shop,
                    secret,
                    storeVersion,
                    _id,
                    storeName,
                    storeType
                }


                //Shopify product payload 
                let productData = {
                    product: {
                        title: product?.title,
                        body_html: `<strong>${product?.description}</strong>`,
                        vendor: storeName,
                        product_type: product?.subCategoryName,
                        status: "draft", //default status of a product is draft 
                        images: product?.productLibraryImages,
                        options: product?.optionsForVarient,
                        variants: product?.variantDataForShopify
                    }

                }
                // ends I


                //add all productLibrary Products in a Products Queue for further operations 
                let addToQueue = productQueue.add({ productData, endPointData, productLibraryId: product._id, userId },
                    {
                        delay: 60000, //queue process after 3 minutes delay 
                        attempts: 1, //execute only one time
                        removeOnComplete: true //remove queue  after complete 
                    })
                    .then((res) => {
                        // console.log(res, "888responsee");

                        return { success: true, message: "All Products Added To Queue" };
                    })
                    .catch((err) => {
                        // console.log(err, "error");
                        return { success: false, message: "Error While Products Adding To Queue" };

                    })

                return addToQueue

            })
            //ends

            const responses = await Promise.all(addToQueuePromises);//resolve promise


            // Check if all responses are successful
            const allSuccessfull = responses.every(response => response.success);

            if (allSuccessfull) {

                //create bulk operation for update 
                const bulkOperations = findPushProducts?.data?.map(({ _id, retryCount }) => ({
                    updateOne: {
                        filter: { _id: _id, userId: userId },
                        update: { $set: { status: 2, retryCount: retryCount + 1, pushedDate: helpers.getCurrentDate() } }  //update status 2 for processing
                    }
                }));

                //update items in bulk
                // const result = await ProductQueue.bulkWrite(bulkOperations);
                let result = await bulkOperationQuery(ProductQueue, bulkOperations)

                //if items insert in queue model successfully then return  success response
                if (result.status) {
                    return helpers.showResponse(true, ResponseMessages.product.retry_push_to_store_sucess, {}, null, 200);
                }

                return helpers.showResponse(false, ResponseMessages.product.retry_push_to_store_fail, {}, null, 400);
            } else {
                return helpers.showResponse(false, ResponseMessages.product.retry_push_to_store_fail, {}, null, 400);
            }

        }
        catch (err) {
            // console.log(err, "errorrr");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    //ends
    // addProductToShopify: async (data, userId) => {
    //     try {
    //         let { productLibraryItems, storeId } = data
    //         console.log(data, "dataaa");

    //         let findStore = await getSingleData(Store, { _id: storeId, userId: userId })

    //         if (!findStore.status) {
    //             return helpers.showResponse(false, ResponseMessages?.store.store_not_exist, null, null, 400);
    //         }

    //         console.log(findStore, "findStore");
    //         let { apiKey, shop, secret, storeVersion, storeName } = findStore?.data

    //         let endPointData = {
    //             apiKey,
    //             shop,
    //             secret,
    //             storeVersion
    //         }

    //         let productLibraryIds = productLibraryItems?.map(({ productLibraryId }) => mongoose.Types.ObjectId(productLibraryId))

    //         //check all product library exist or not 
    //         const findProductLibraryIds = await getDataArray(ProductLibrary, { _id: { $in: productLibraryIds }, status: { $ne: 2 } })

    //         if (findProductLibraryIds?.data?.length !== productLibraryIds?.length) {
    //             return helpers.showResponse(false, ResponseMessages?.product.invalid_product_library_id, {}, null, 400);
    //         }

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
    //             {
    //                 $lookup: {
    //                     from: 'product',
    //                     localField: 'productId',
    //                     foreignField: '_id',
    //                     as: 'productData',
    //                     pipeline: [
    //                         {
    //                             $lookup: {
    //                                 from: 'subCategory',
    //                                 localField: 'subCategoryId',
    //                                 foreignField: '_id',
    //                                 as: 'subCategoryData',
    //                                 pipeline: [
    //                                     // {
    //                                     //     $match: {
    //                                     //         status: { $ne: 2 }
    //                                     //     }

    //                                     // },
    //                                     {
    //                                         $project: {
    //                                             _id: 1,
    //                                             name: 1
    //                                         }
    //                                     }
    //                                 ]

    //                             }
    //                         },
    //                         {
    //                             $unwind: "$subCategoryData"
    //                         },
    //                         {
    //                             $project: {
    //                                 subCategoryData: 1,
    //                             }
    //                         }
    //                     ]

    //                 }
    //             },
    //             {
    //                 $unwind: "$productData" //product is single document

    //             },
    //             //we add lookup for product library varient because it has product varient id for lookup 
    //             {
    //                 $lookup: {
    //                     from: 'productLibraryVarient',
    //                     localField: '_id',
    //                     foreignField: 'productLibraryId',
    //                     as: 'varientData', //it canbe multiple items product has multiple variants
    //                     pipeline: [
    //                         {
    //                             $lookup: {
    //                                 from: 'productVarient',
    //                                 localField: 'productVarientId',
    //                                 foreignField: '_id',
    //                                 as: 'productVarientData', //product vaarient data should be single document because we are fetching one item with id 
    //                                 pipeline: [
    //                                     // {
    //                                     //     $match: {
    //                                     //         status: { $ne: 2 }
    //                                     //     }
    //                                     // },
    //                                     {
    //                                         $lookup: {
    //                                             from: 'variableOptions',
    //                                             localField: 'varientOptions.variableOptionId',
    //                                             foreignField: '_id',
    //                                             as: 'variableOptionData',// it should be array of objects because it canbe multiple
    //                                             pipeline: [
    //                                                 {
    //                                                     $lookup: {
    //                                                         from: 'variableTypes',
    //                                                         localField: 'variableTypeId',
    //                                                         foreignField: '_id',
    //                                                         as: 'variableTypesData',

    //                                                     }
    //                                                 },
    //                                                 {
    //                                                     $unwind: {
    //                                                         path: "$variableTypesData"
    //                                                     }
    //                                                 },
    //                                                 {
    //                                                     $project: {
    //                                                         _id: 1,
    //                                                         value: 1,
    //                                                         variableTypeId: 1,
    //                                                         typeName: '$variableTypesData.typeName'

    //                                                     }

    //                                                 }

    //                                             ]
    //                                         }
    //                                     },
    //                                     {
    //                                         $project: {
    //                                             _id: 1,
    //                                             productId: 1,
    //                                             // price: 1,
    //                                             productCode: 1,
    //                                             // varientOptions: 1,
    //                                             variableOptionData: 1
    //                                         }
    //                                     }

    //                                 ]
    //                             }
    //                         },
    //                         {
    //                             $unwind: {
    //                                 path: "$productVarientData"
    //                             }
    //                         },
    //                         //here we create varient data and options for product add in shopify
    //                         {
    //                             $addFields: {
    //                                 variant: {
    //                                     option1: {
    //                                         $reduce: {
    //                                             input: "$productVarientData.variableOptionData",
    //                                             initialValue: "",
    //                                             in: {
    //                                                 $concat: [
    //                                                     "$$value",
    //                                                     { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
    //                                                     "$$this.value"
    //                                                 ]
    //                                             }
    //                                         }
    //                                     },
    //                                     price: "$price",
    //                                     sku: "$productVarientData.productCode"
    //                                 },
    //                                 options: {
    //                                     name: {
    //                                         $reduce: {
    //                                             input: "$productVarientData.variableOptionData",
    //                                             initialValue: "",
    //                                             in: {
    //                                                 $concat: [
    //                                                     "$$value",
    //                                                     { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
    //                                                     "$$this.typeName"
    //                                                 ]
    //                                             }
    //                                         }
    //                                     },
    //                                     position: 1
    //                                 }
    //                             }
    //                         },
    //                         //in varient data only project Variant Data And Options
    //                         {
    //                             $project: {
    //                                 _id: 1,
    //                                 productLibraryId: 1,
    //                                 productVarientId: 1,
    //                                 price: 1,
    //                                 profit: 1,
    //                                 //    productLibraryVarientImages:1,
    //                                 status: 1,
    //                                 // productVarientData: 1,
    //                                 variant: 1,
    //                                 options: 1


    //                             }
    //                         }
    //                     ]

    //                 }
    //             },
    //             //find unique name and return it for shopify payload
    //             {
    //                 $addFields: {
    //                     optionsForVarient: {
    //                         $map: {
    //                             input: { $setUnion: "$varientData.options.name" },
    //                             as: "name",
    //                             in: { name: "$$name" }
    //                         }
    //                     },
    //                     productLibraryImages: {
    //                         $map: {
    //                             input: "$productLibraryImages",
    //                             as: "image",
    //                             in: { src: { $concat: [consts.BITBUCKET_URL_DEV, "/", "$$image.imageUrl"] } }
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     _id: 1,
    //                     productId: 1,
    //                     title: 1,
    //                     description: 1,
    //                     status: 1,
    //                     addToStore: 1,
    //                     productLibraryImages: 1,
    //                     subCategoryName: "$productData.subCategoryData.name",
    //                     // productData: 1,
    //                     // varientData: 1, //variants canbe multiple 
    //                     optionsForVarient: 1,
    //                     variantDataForShopify: "$varientData.variant" // One Product Has Multiple variant
    //                 }
    //             }


    //         ])
    //         //ends of aggregation

    //         let libData = result[0]
    //         console.log(libData, "libData");


    //         let productData = {
    //             product: {
    //                 title: libData?.title,
    //                 body_html: `<strong>${libData?.description}</strong>`,
    //                 vendor: storeName,
    //                 product_type: libData?.subCategoryName,
    //                 status: "draft", //default status of a product is draft 
    //                 images: libData?.productLibraryImages,
    //                 options: libData?.optionsForVarient,
    //                 variants: libData?.variantDataForShopify
    //             }

    //         }




    //         let addToStoreApi = await helpers.addProductToShopify(endPointData, productData)

    //         // product add then add varient
    //         if (addToStoreApi.status) {

    //             // let productId = addToStoreApi?.data?.product?.id

    //             //add varient api 
    //             // let addVarientApi = await helpers.addProductVarientToShopify(endPointData, varientData, productId)

    //             // //if success then return 
    //             // if (addVarientApi.status) {

    //             //     return helpers.showResponse(true, addToStoreApi.message, addToStoreApi.data, null, 200)
    //             // } else {

    //             //     return helpers.showResponse(false, "errr varient", {}, null, 400);

    //             // }


    //             return helpers.showResponse(true, addToStoreApi.message, addToStoreApi.data, null, 200)
    //         }
    //         return helpers.showResponse(false, addToStoreApi.data, addToStoreApi.message ? productData : ResponseMessages?.product.add_to_store_fail, null, 400);
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