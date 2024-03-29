require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const LibraryImages = require('../models/LibraryImages');
const ProductLibrary = require('../models/ProductLibrary');
const ProductLibraryVarient = require("../models/ProductLibraryVarient");

const productLibrary = {

    saveLibraryImage: async (data, file) => {
        try {
            let { imageType } = data

            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }
            let obj = {
                fileName: '',
                imageUrl: s3Upload.data[0],
                imageType,
            }
            let libraryRef = new LibraryImages(obj)
            let result = await postData(libraryRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.img_save_err, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.img_save_sucess, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    getLibraryImages: async () => {
        try {

            const result = await getDataArray(LibraryImages, {})

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    createProductLibrary: async (data, userId, files) => {
        try {
            let { productId, title, description, productLibraryImages = [], productLibraryVarients, price } = data

            if (typeof productLibraryImages == 'string') {
                productLibraryImages = JSON.parse(productLibraryImages)

            }
            if (typeof productLibraryVarients == 'string') {
                productLibraryVarients = JSON.parse(productLibraryVarients)

            }
            // console.log(files, "fileass");
            let productlibImages

            if (files?.length > 0 && productLibraryImages.length === 0) {
                const s3Upload = await helpers.uploadFileToS3(files)
                if (!s3Upload.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
                }
                productlibImages = s3Upload.data.map((img) => {
                    let obj = {}
                    obj._id = mongoose.Types.ObjectId()
                    obj.imageUrl = img
                    return obj

                })

            }

            if (productLibraryImages.length > 0 && files?.length === 0) {
                console.log(productLibraryImages, "-------------");

                productlibImages = productLibraryImages.map((value) => {
                    let obj = { ...value }
                    obj._id = mongoose.Types.ObjectId()
                    // obj.imageUrl = value.valueimageUrl
                    return obj
                })

            }

            let obj = {
                userId,
                productId,
                description,
                title,
                retailPrice: Number(price) * 2,
                createdOn: helpers.getCurrentDate(),
                productLibraryImages: productlibImages,
                varientCount: productLibraryVarients?.length, //count of total varients
            }
            const prodRef = new ProductLibrary(obj)
            const result = await postData(prodRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_save_failed, {}, null, 400);
            }
            productLibraryVarients = productLibraryVarients?.map((value) => {
                let obj = {
                    productLibraryId: result?.data?._id,
                    productVarientId: value.productVarientId,
                    profit: Number(Number(value.price) * 2 - Number(value.price)),
                    price: Number(value.price) * 2,
                    productLibraryVarientImages: productlibImages,
                    createdOn: helpers.getCurrentDate()
                }
                return obj
            })

            const libraryVareintSaved = await insertMany(ProductLibraryVarient, productLibraryVarients)

            if (!libraryVareintSaved.status) {
                //delete productlibrary if failed 
                await deleteById(ProductLibrary, result.data._id)
                return helpers.showResponse(false, ResponseMessages?.product.product_save_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.product.product_created, result?.data, null, 200);
        }
        catch (err) {
            console.log(err, "errorrr");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },

    updateProductLibrary: async (data) => {
        try {
            let { productLibraryId, description, title } = data
            let updateDataObj = {
                updatedOn: helpers.getCurrentDate()
            }
            let matchObj = {
                _id: productLibraryId,
                status: { $ne: 2 }
            }

            const find = await getSingleData(ProductLibrary, matchObj)
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
            }

            if (description) {
                updateDataObj.description = description
            }
            if (title) {
                updateDataObj.title = title
            }
            const response = await updateSingleData(ProductLibrary, updateDataObj, matchObj)
            if (!response.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, {}, null, 200);
        }
        catch (err) {
            console.log(err, "error sideeee");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    updateProductLibraryVarient: async (data) => {
        try {
            let { productLibraryVariantId, price, profit } = data

            let matchObj = {
                _id: productLibraryVariantId,
                status: { $ne: 2 }
            }

            let updateData = {
                price,
                profit,
                updatedOn: helpers.getCurrentDate()
            }

            const find = await getSingleData(ProductLibraryVarient, matchObj)
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_varient_not_exist, {}, null, 400);
            }
            const result = await updateSingleData(ProductLibraryVarient, updateData, matchObj)
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result.data, null, 200);

        }
        catch (err) {
            console.log(err, "error sideeee");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    deleteProductLibraryOrVarient: async (data) => {
        try {
            let { productLibraryId, productLibraryVariantId } = data

            let matchObjLibrary = {
                _id: productLibraryId,
                status: { $ne: 2 }
            }
            let updateData = {
                status: 2
            }
            //if both ids are present then delete vareint of product library  else whole productLibrary with varients
            if (productLibraryId && productLibraryVariantId) {

                let matchObjVarient = {
                    _id: productLibraryVariantId,
                    productLibraryId: productLibraryId,
                    status: { $ne: 2 }
                }

                //find library varient exist or not 
                const findProductLibrary = await getSingleData(ProductLibrary, { _id: productLibraryId, status: { $ne: 2 } })
                if (!findProductLibrary.status) {
                    return helpers.showResponse(false, ResponseMessages?.product.invalid_product_library_id, {}, null, 400);
                }

                //find library varient exist or not 
                const findVarient = await getSingleData(ProductLibraryVarient, matchObjVarient)
                if (!findVarient.status) {
                    return helpers.showResponse(false, ResponseMessages?.product.product_varient_not_exist, {}, null, 400);
                }

                //soft delete the varient  with match object 
                const resultVarient = await updateSingleData(ProductLibraryVarient, updateData, matchObjVarient)
                if (!resultVarient.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
                }

                //check how many varient are present in product library if zero vareints then delete product library as well as varient
                let findAllVarient = await getCount(ProductLibraryVarient, { productLibraryId, status: { $ne: 2 } })
                if (findAllVarient.data === 0) {
                    //here we delete the whole product library 
                    const deleteProductLibrary = await updateSingleData(ProductLibrary, updateData, { _id: productLibraryId })
                    if (!deleteProductLibrary.status) {
                        return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
                    }
                    return helpers.showResponse(true, "Product Library Deleted", {}, null, 200);

                }
                const updateVarientCount = await updateSingleData(ProductLibrary, { varientCount: findProductLibrary?.data?.varientCount + 1 }, { _id: productLibraryId })

                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);

            } else if (productLibraryId) {

                const find = await getSingleData(ProductLibrary, matchObjLibrary)
                if (!find.status) {
                    return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
                }

                const result = await updateSingleData(ProductLibrary, updateData, matchObjLibrary)
                if (!result.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
                }
                // const resultVarient = await updateSingleData(ProductLibraryVarient, updateData, matchObjVarient)
                await updateByQuery(ProductLibraryVarient, { status: 2 }, { productLibraryId: productLibraryId })

                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
            }

        }
        catch (err) {
            console.log(err, "error delete side");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    getProductLibrary: async (data) => {
        try {
            let { pageSize = 10, page = 1, sortDirection = "asc", sortColumn = "title", materialFilter = [], searchKey = '' } = data;
            pageSize = Number(pageSize)
            page = Number(page)

            let searchTerms
            let titleSearch = ''
            let valueSearch = ''  //default value is blank string

            if (searchKey) {
                searchTerms = searchKey.split(' ');
                titleSearch = searchTerms[0];
                valueSearch = searchTerms.slice(1).join(' ');
            }

            console.log(searchTerms, "searchTerms ");
            console.log(titleSearch, "titleSearch ");
            console.log(valueSearch, "valueSearch");

            let matchObj = {
                status: { $ne: 2 },
            }

            if (titleSearch) {
                matchObj.title = { $regex: titleSearch, $options: 'i' }
            }

            let materialSearch = {}

            if (materialFilter && materialFilter?.length > 0) {

                if (typeof materialFilter == 'string') {
                    materialFilter = JSON.parse(materialFilter)
                }
                materialFilter = materialFilter.map((id) => new ObjectId(id))

                materialSearch["productData.materialId"] = { $in: materialFilter }

            }

            let aggregate = [
                {
                    $match: {
                        ...matchObj,
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productData',

                    }
                },
                {
                    $lookup: {
                        from: 'storeProducts',
                        localField: '_id',
                        foreignField: 'productLibraryId',
                        as: 'storeProductsData',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'store',
                                    localField: 'storeId',
                                    foreignField: '_id',
                                    as: 'storeDetails',
                                    pipeline: [
                                        {
                                            $project: {
                                                storeName: 1,
                                                shop: 1,
                                                storeType: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$storeDetails",
                                    preserveNullAndEmptyArrays: true
                                }
                            }
                        ]

                    }
                },
                {
                    $lookup: {
                        from: 'productLibraryVarient',
                        localField: '_id',
                        foreignField: 'productLibraryId',
                        as: 'varientData', //it canbe multiple items product has multiple variants
                        //this pipiline is for searching 
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'productVarient',
                                    localField: 'productVarientId',
                                    foreignField: '_id',
                                    as: 'productVarientData', //product vaarient data should be single document because we are fetching one item with id 
                                    pipeline: [
                                        {
                                            $match: {
                                                status: { $ne: 2 }
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'variableOptions',
                                                localField: 'varientOptions.variableOptionId',
                                                foreignField: '_id',
                                                as: 'variableOptionData',// it should be array of objects because it canbe multiple
                                                pipeline: [
                                                    // {
                                                    //     $match: {
                                                    //         "value": { $regex: valueSearch, $options: 'i' },
                                                    //     }
                                                    // },
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
                            {
                                $project: {
                                    _id: 1,
                                    price: 1,
                                    variableOptionData: "$productVarientData.variableOptionData"
                                }
                            }


                        ]
                    }
                },
                {
                    $match: {
                        "varientData.variableOptionData.value": { $regex: valueSearch, $options: 'i' },
                        ...materialSearch
                    }
                },
                {
                    $addFields: {
                        priceStartsFrom: { $min: "$varientData.price" }
                    }
                },

                {
                    $sort: {
                        [sortColumn]: sortDirection === "asc" ? 1 : -1
                    }
                },
                {
                    $project: {
                        varientData: 0,
                        productData: 0

                    }
                },
            ]

            //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
            let { totalCount, aggregation } = await helpers.getCountAndPagination(ProductLibrary, aggregate, page, pageSize)

            const result = await ProductLibrary.aggregate(aggregation);

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { items: result, totalCount }, null, 200);
        }
        catch (err) {
            console.log(err, "error catch");
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    getProductLibraryDetails: async (data) => {
        try {
            const { productLibraryId } = data;

            const result = await ProductLibrary.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(productLibraryId),
                        status: { $ne: 2 },
                    }
                },
                {
                    $lookup: {
                        from: "productLibraryVarient",
                        localField: "_id",
                        foreignField: "productLibraryId",
                        as: "productLibraryVarients",
                        pipeline: [
                            //choose specific feilds to show
                            {
                                $match: {
                                    status: { $ne: 2 },
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    productLibraryId: 1,
                                    productVarientId: 1,
                                    retailPrice: "$price",
                                    profit: 1,
                                    productLibraryVarientImages: 1,
                                    status: 1,
                                    createdOn: 1

                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: "$productLibraryVarients"
                },
                {
                    $lookup: {
                        from: "productVarient",
                        localField: "productLibraryVarients.productVarientId",
                        foreignField: "_id",
                        as: "productVarients",
                        pipeline: [ //choose specific feilds to show
                            {
                                $project: {
                                    _id: 1,
                                    productCode: 1,
                                    costPrice: "$price",
                                    varientOptions: 1,
                                    createdOn: 1

                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: "$productVarients"
                },
                {
                    $lookup: {
                        from: "variableOptions",
                        let: { varientOptions: "$productVarients.varientOptions" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ["$_id", "$$varientOptions.variableOptionId"]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "variableTypes",
                                    localField: "variableTypeId",
                                    foreignField: "_id",
                                    as: "productVariableType",
                                }
                            },
                            {
                                $unwind: "$productVariableType"
                            },
                            {

                                $project: {
                                    _id: 1,
                                    variableTypeId: 1,
                                    value: 1,
                                    // Add other fields you want to include in the result
                                    variableTypeName: '$productVariableType.typeName' // Example of creating a new field
                                }

                            }

                        ],
                        as: "productVarientOptions",
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        title: { $first: "$title" },
                        description: { $first: "$description" },
                        status: { $first: "$status" },
                        addToStore: { $first: "$addToStore" },
                        designDetails: { $first: "$designDetails" },
                        productLibraryImages: { $first: "$productLibraryImages" },
                        userId: { $first: "$userId" },
                        productId: { $first: "$productId" },
                        createdOn: { $first: "$createdOn" },
                        productLibraryVarients: {
                            $push: {
                                $mergeObjects: [
                                    "$productLibraryVarients",
                                    {
                                        productVarients: {
                                            _id: "$productVarients._id",
                                            productCode: "$productVarients.productCode",
                                            costPrice: "$productVarients.costPrice"
                                        },
                                        productVarientOptions: "$productVarientOptions",
                                        profitPercent: {
                                            $round: [{
                                                $multiply: [
                                                    {
                                                        $divide: [
                                                            {
                                                                $subtract: [
                                                                    { $toDouble: "$productLibraryVarients.retailPrice" },
                                                                    { $toDouble: "$productVarients.costPrice" }
                                                                ]
                                                            },
                                                            { $toDouble: "$productVarients.costPrice" }
                                                        ],
                                                    },
                                                    100
                                                ],
                                            },
                                                2
                                            ],

                                        },

                                    },

                                ]
                            },

                        }
                    }
                },

            ]);

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result.length > 0 ? result[0] : result, null, 200);

        } catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },


}

module.exports = {
    ...productLibrary
}