require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const LibraryImages = require('../models/LibraryImages');
const ProductLibrary = require('../models/ProductLibrary');

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
    createProductLibrary: async (data, userId) => {
        try {
            let { productId, title, description, productLibraryImages, productLibraryVarients, price } = data

            console.log(productLibraryImages, "productLibraryImages");
            console.log(productLibraryVarients, "productLibraryVarients");

            if (productLibraryVarients) {
                let abc = {}
                productLibraryVarients = productLibraryVarients.map((value) => {
                    let obj = {
                        _id: mongoose.Types.ObjectId(),
                        productVarientId: value.productVarientId,
                        price: value.price,
                        profit: Number(Number(value.price) * 2 - Number(value.price)),
                        retailPrice: Number(value.price) * 2
                    }
                    abc = obj
                    return obj
                })
                console.log(abc, "objjjj");
            }
            const findProduct = await getSingleData(ProductLibrary, { title: title, status: { $ne: 2 } })
            if (findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_already_existed, {}, null, 400);
            }

            let obj = {
                userId,
                productId,
                description,
                title,
                retailPrice: Number(price) * 2,
                createdOn: helpers.getCurrentDate(),
                productLibraryImages,
                productLibraryVarients
            }
            const prodRef = new ProductLibrary(obj)
            const result = await postData(prodRef)


            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_save_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.product.product_created, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    updateProductLibrary: async (data, userId) => {
        try {
            let { productLibraryId, productLibraryVariantId, retailPrice, productLibraryImages } = data

            // console.log(productLibraryImages, "productLibraryImages");


            const find = await getSingleData(ProductLibrary, { _id: productLibraryId, status: { $ne: 2 } })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
            }

            const previousVariant = find.data.productLibraryVarients.find((variant) => variant._id.toString() == productLibraryVariantId.toString());

            console.log(previousVariant, "previousVariant");
            if (!previousVariant) {
                return helpers.showResponse(false, "varient not exist", {}, null, 400);
            }

            // Calculate profit based on the previous price
            const previousPrice = previousVariant.price;
            const profit = Number(retailPrice) - previousPrice;

            const updateData = {
                "productLibraryVarients.$.retailPrice": Number(retailPrice),
                "productLibraryVarients.$.profit": Number(profit),
                updatedOn: helpers.getCurrentDate(),
            };

            if (productLibraryImages) {
                updateData.productLibraryImages = productLibraryImages
            }

            // Update the document
            const result = await ProductLibrary.updateOne(
                {
                    "_id": productLibraryId,
                    "productLibraryVarients._id": productLibraryVariantId
                },
                { $set: updateData }
            );

            if (result.modifiedCount > 0) {
                return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);

        }
        catch (err) {
            console.log(err, "error sideeee");
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    getProductLibrary: async (data) => {
        try {
            let { pageSize = 10, page = 1, sortDirection = "asc", sortColumn = "title", materialFilter, searchKey = '' } = data;
            pageSize = Number(pageSize)
            page = Number(page)

            let matchObj = {
                status: { $ne: 2 },
            }
            if (searchKey) {
                matchObj.title = { $regex: searchKey, $options: 'i' }
            }


            console.log(matchObj, "matchObj");

            if (materialFilter) {

                materialFilter = materialFilter.map((id) => new ObjectId(id))
            }

            let countAggregate = [
                {
                    $match: {
                        ...matchObj,
                    }
                },

            ];

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
                    $addFields: {
                        priceStartFrom: { $min: "$productLibraryVarients.retailPrice" }
                    }
                },

                {
                    $sort: {
                        [sortColumn]: sortDirection === "asc" ? 1 : -1
                    }
                },

            ]

            console.log(materialFilter, "material8889090");
            if (materialFilter && materialFilter !== 'null') {
                let lookupObj = {
                    $lookup: {
                        from: "product",
                        localField: "productId",
                        foreignField: "_id",
                        as: "ProductData",

                    }
                }
                let matchObj = {
                    $match: {
                        "ProductData.materialId": { $in: materialFilter }
                    }
                }
                let unsetObj = {
                    $unset: "ProductData"
                }


                aggregate.push(
                    { ...lookupObj }, { ...matchObj }, { ...unsetObj }
                )
                countAggregate.push({ ...lookupObj }, { ...matchObj }, { ...unsetObj },)


            }

            console.log(countAggregate, "countAggregate");
            console.log(aggregate, "aggregate");

            const result = await ProductLibrary.aggregate(aggregate);

            countAggregate.push({
                $count: "totalCount"
            })
            let count = await ProductLibrary.aggregate(countAggregate)
            console.log(count, "count");

            let totalCount = count[0]?.totalCount ? count[0].totalCount : 0
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
            // const result = await ProductLibrary.aggregate([
            //     {
            //         $match: {
            //             _id: mongoose.Types.ObjectId(productLibraryId),
            //             status: { $ne: 2 },
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "productVarient",
            //             localField: "productLibraryVarients.productVarientId",
            //             foreignField: "_id",
            //             as: "ProductVarientData",
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "variableOptions",
            //             localField: "ProductVarientData.varientOptions.variableOptionId",
            //             foreignField: "_id",
            //             as: "variableOptionsData",
            //         }
            //     },
            //     // {
            //     //     $project:{

            //     //     }
            //     // }
            //     // {
            //     //     $addFields: {
            //     //         productLibraryVarients: {
            //     //             $map: {
            //     //                 input: "$productLibraryVarients",
            //     //                 as: "plv",
            //     //                 in: {
            //     //                     $mergeObjects: [
            //     //                         "$$plv",
            //     //                         {
            //     //                             ProductVarient: {
            //     //                                 $arrayElemAt: [
            //     //                                     {
            //     //                                         $filter: {
            //     //                                             input: "$ProductVarientData",
            //     //                                             as: "pv",
            //     //                                             cond: {
            //     //                                                 $eq: ["$$plv.productVarientId", "$$pv._id"]
            //     //                                             }
            //     //                                         }
            //     //                                     },
            //     //                                     0 // Get the first element of the array
            //     //                                 ]
            //     //                             }
            //     //                         }
            //     //                     ]
            //     //                 }
            //     //             }
            //     //         }
            //     //     }
            //     // },

            //     // {
            //     //     $lookup: {
            //     //         from: "variableOptions",
            //     //         localField: "ProductVarient.varientOptions.variableOptionId",
            //     //         foreignField: "_id",
            //     //         as: "variableOptionss",
            //     //     }
            //     // },

            //     // {
            //     //     $unset: "ProductVarient"
            //     // },
            // ]);

            let query = {
                _id: mongoose.Types.ObjectId(productLibraryId),
                status: { $ne: 2 }
            }
            let populate = [{
                path: 'productLibraryVarients.productVarientId',
                populate: {
                    path: 'varientOptions.variableOptionId', // Add the path for nested population
                },

                select: 'productVarientId.varientOptions'
            }]

            let result = await getSingleData(ProductLibrary, query, '', populate);
            console.log(result, 'result')


            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result.data, null, 200);

        } catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },


}

module.exports = {
    ...productLibrary
}