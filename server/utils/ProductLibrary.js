require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const LibraryImages = require('../models/LibraryImages');
const ProductLibrary = require('../models/ProductLibrary');
const ProductLibraryVarient = require("../models/ProductLibraryVarient")
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

            console.log(productLibraryImages, "productLibraryImages");
            console.log(productLibraryVarients, "productLibraryVarients");

            if (typeof productLibraryImages == 'string') {
                productLibraryImages = JSON.parse(productLibraryImages)

            }
            if (typeof productLibraryVarients == 'string') {
                productLibraryVarients = JSON.parse(productLibraryVarients)

            }
            // console.log(files, "fileass");
            let productlibImages

            if (files?.length > 0 && productLibraryImages.length === 0) {
                console.log("under multer iff");
                const s3Upload = await helpers.uploadFileToS3(files)
                if (!s3Upload.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
                }
                console.log(s3Upload.data, "s3uploaddd");
                productlibImages = s3Upload.data.map((img) => {
                    let obj = {}
                    obj._id = mongoose.Types.ObjectId()
                    obj.imageUrl = img
                    return obj

                })

            }

            if (productLibraryImages.length > 0 && files?.length === 0) {
                console.log("under image Static url iff");
                console.log(productLibraryImages, "-------------");

                productlibImages = productLibraryImages.map((value) => {
                    let obj = { ...value }
                    obj._id = mongoose.Types.ObjectId()
                    // obj.imageUrl = value.valueimageUrl
                    return obj
                })

            }

            const findProduct = await getSingleData(ProductLibrary, { title: title, status: { $ne: 2 } })
            if (findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_already_existed, {}, null, 400);
            }


            console.log(productlibImages, "productlibImages");

            let obj = {
                userId,
                productId,
                description,
                title,
                retailPrice: Number(price) * 2,
                createdOn: helpers.getCurrentDate(),
                productLibraryImages: productlibImages,
                productLibraryVarients
            }
            const prodRef = new ProductLibrary(obj)
            const result = await postData(prodRef)


            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_save_failed, {}, null, 400);
            }
            // if (productLibraryVarients) {
            productLibraryVarients = productLibraryVarients.map((value) => {
                let obj = {
                    productLibraryId: result?.data?._id,
                    productVarientId: value.productVarientId,
                    // retailPrice: value.price,
                    profit: Number(Number(value.price) * 2 - Number(value.price)),
                    price: Number(value.price) * 2,
                    productLibraryVarientImages: productlibImages,
                    createdOn: helpers.getCurrentDate()
                }
                return obj
            })

            const libraryVareintSaved = await insertMany(ProductLibraryVarient, productLibraryVarients)

            console.log(libraryVareintSaved, "libraryVareintSaved");
            if (!libraryVareintSaved.status) {
                //delete productlibrary if failed 
                await deleteById(ProductLibrary, result.data._id)
                return helpers.showResponse(false, ResponseMessages?.product.product_save_failed, {}, null, 400);
            }

            // }

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

            if (productLibraryId && productLibraryVariantId) {

                let matchObjVarient = {
                    _id: productLibraryVariantId,
                    productLibraryId: productLibraryId,
                    status: { $ne: 2 }
                }

                const findVarient = await getSingleData(ProductLibraryVarient, matchObjVarient)
                if (!findVarient.status) {
                    return helpers.showResponse(false, ResponseMessages?.product.product_varient_not_exist, {}, null, 400);
                }

                const resultVarient = await updateSingleData(ProductLibraryVarient, updateData, matchObjVarient)
                if (!resultVarient.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
                }

                let findAllVarient = await getCount(ProductLibraryVarient, { productLibraryId, status: { $ne: 2 } })
                if (findAllVarient.data === 0) {
                    const deleteProductLibrary = await updateSingleData(ProductLibrary, updateData, { _id: productLibraryId })
                    if (!deleteProductLibrary.status) {
                        return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
                    }
                    return helpers.showResponse(true, "Product Library Deleted", {}, null, 200);

                }
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
            let { pageSize = 10, page = 1, sortDirection = "asc", sortColumn = "title", materialFilter, searchKey = '' } = data;
            pageSize = Number(pageSize)
            page = Number(page)

            let searchTerms
            let titleSearch
            let valueSearch
            
            if (searchKey) {
                searchTerms = searchKey.split(' ');
                titleSearch = searchTerms[0];
                valueSearch = searchTerms.slice(1).join(' ');
            }




            console.log(titleSearch, "titleSearch ");
            console.log(valueSearch, "valueSearch");

            let matchObj = {
                status: { $ne: 2 },
            }

            if (titleSearch) {
                matchObj.title = { $regex: titleSearch, $options: 'i' }
            }


            console.log(matchObj, "matchObj");

            let aggregate = [
                {
                    $match: {
                        ...matchObj,
                    }
                },
                {
                    $skip: (page - 1) * pageSize // Skip records based on the page number
                },
                {
                    $limit: pageSize // Limit the number of records per page
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

                {
                    $sort: {
                        [sortColumn]: sortDirection === "asc" ? 1 : -1
                    }
                },
            ]


            if (materialFilter) {

                if (typeof materialFilter == 'string') {
                    materialFilter = JSON.parse(materialFilter)
                }

                materialFilter = materialFilter.map((id) => new ObjectId(id))

                console.log(materialFilter, "materialFilter after");
                //add aggregation for material filter match 
                aggregate.push(
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'productId',
                            foreignField: '_id',
                            as: 'productData',

                        }
                    },
                    {
                        $match: {
                            "productData.materialId": { $in: materialFilter }
                        }
                    },
                    // {
                    //     $project: {
                    //         productData: 0
                    //     }
                    // }
                )

            }
            if (valueSearch) {
                //search in vareint option value deep search 
                console.log(valueSearch, "valueSearch value search");

                let match = {
                    $match: {
                        "variableOptionData.value": { $regex: valueSearch, $options: 'i' },
                    }
                }

                aggregate.push(match)

            }

            //remove extra feilds that is get after lookup
            let project = {
                $project: {
                    varientData: 0,
                    variableOptionData: 0,
                    productVarientData: 0
                }
            }
            // aggregate.push(project)

            console.log(aggregate, "aggregate");

            const result = await ProductLibrary.aggregate(aggregate);

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { items: result }, null, 200);
        }
        catch (err) {
            console.log(err, "error catch");
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    getProductLibraryDetails: async (data) => {
        try {
            const { productLibraryId } = data;

            console.log(productLibraryId, "productLibraryId");
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