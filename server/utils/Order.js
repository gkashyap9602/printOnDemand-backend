require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const Gallery = require('../models/Gallery')
const Order = require('../models/Orders')
const Cart = require('../models/Cart')
const orderUtil = {

    addToCart: async (data) => {
        try {
            let { cartItems } = data

            cartItems.map((value) => value.createdOn = helpers.getCurrentDate())

            let response = await insertMany(Cart, cartItems);
            if (response.status) {
                return helpers.showResponse(true, ResponseMessages.common.added_success, null, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages.common.save_failed, null, null, 400);
        } catch (error) {
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    getCartItems: async (data) => {
        let { pageIndex = 1, pageSize = 5 } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        // let totalCount = await getCount(Gallery, { status: { $ne: 2 }, type: Number(type) })

        ///////
        const aggregationPipeline = [
            {
                $match: {
                    status: { $ne: 2 },
                },
            },
            {
                $lookup: {
                    from: "productLibraryVarient",
                    localField: "productLibraryVariantId",
                    foreignField: "_id",
                    as: "productLibraryVarientData",
                    pipeline: [
                        {
                            $lookup: {
                                from: "productLibrary",
                                localField: "productLibraryId",
                                foreignField: "_id",
                                as: "productLibraryData",
                                pipeline: [{
                                    $project: {
                                        _id: 1,
                                        productId: 1,
                                        title: 1,
                                        description: 1,


                                    }
                                }]
                            }
                        },
                        {
                            $unwind: "$productLibraryData"
                        },
                        {
                            $lookup: {
                                from: "productVarient",
                                localField: "productVarientId",
                                foreignField: "_id",
                                as: "productVarientData",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "variableOptions",
                                            localField: "varientOptions.variableOptionId",
                                            foreignField: "_id",
                                            as: "variableOptionData",
                                            pipeline: [
                                                {
                                                    $lookup: {
                                                        from: "variableTypes",
                                                        localField: "variableTypeId",
                                                        foreignField: "_id",
                                                        as: "variableTypeData",
                                                    }
                                                },
                                                {
                                                    $unwind: "$variableTypeData"
                                                },
                                                {

                                                    $project: {
                                                        _id: 1,
                                                        variableTypeId: 1,
                                                        value: 1,
                                                        // Add other fields you want to include in the result
                                                        variableTypeName: '$variableTypeData.typeName' // Example of creating a new field
                                                    }
                    
                                                }

                                            ]
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            costPrice: "$price",
                                            productCode: 1,
                                            variableOptionData:1
                                            // varientOptions: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: "$productVarientData"
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
                                title: "$productLibraryData.title",
                                description: "$productLibraryData.description",
                                productCode: "$productVarientData.productCode",
                                costPrice: "$productVarientData.costPrice",
                                productVarientOption: "$productVarientData.variableOptionData"

                            }
                        }
                    ]

                }
            },
            {
                $unwind: "$productLibraryVarientData"
            },
            // {
            //     $skip: (pageIndex - 1) * pageSize // Skip records based on the page number
            // },
            // {
            //     $limit: pageSize // Limit the number of records per page
            // },

            // {
            //     $project: {

            //     }
            // }
        ];

        const result = await Cart.aggregate(aggregationPipeline);

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result, null, 200);
    },

    // deleteFromGallery: async (data) => {
    //     try {
    //         const { title, galleryId, type } = data

    //         const find = await getSingleData(Gallery, { status: { $ne: 2 }, _id: galleryId, type })
    //         if (!find.status) {
    //             return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
    //         }

    //         let obj = {
    //             title,
    //             status: 2,
    //             updatedOn: helpers.getCurrentDate(),
    //         }

    //         const result = await updateSingleData(Gallery, obj, { _id: galleryId, status: { $ne: 2 }, type })

    //         if (!result.status) {
    //             return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
    //         }

    //         return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
    //     }
    //     catch (err) {
    //         return helpers.showResponse(false, err?.message, null, null, 400);

    //     }

    // },


}

module.exports = {
    ...orderUtil
}