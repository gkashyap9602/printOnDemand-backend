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

    getCartItems: async (data) => {
        let { pageIndex = 1, pageSize = 5 } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        // let totalCount = await getCount(Gallery, { status: { $ne: 2 }, type: Number(type) })


        const aggregationPipeline = [

            // {
            //     $match: {
            //         status: { $ne: 2 },
            //     },
            // },
            {
                $lookup: {
                    from: "ProductLibrary",
                    localField: "productLibraryId",
                    foreignField: "_id",
                    as: "ProductLibraryData"
                }
            }
            // {
            //     $skip: (pageIndex - 1) * pageSize // Skip records based on the page number
            // },
            // {
            //     $limit: pageSize // Limit the number of records per page
            // },
        ];


        // const result = await Cart.aggregate(aggregationPipeline);

        // let query = {
        //     // _id: mongoose.Types.ObjectId(productLibraryId),
        //     status: { $ne: 2 }
        // }
        let populate = [
            {
                path: 'productLibraryVariantId', // Use the actual field name in your Cart schema
                // populate: {
                //     path: 'productVarientId', // Add any other fields you want to populate
                // },
            },
        ];

        let result = await getSingleData(Cart, {}, '', populate);
        console.log(result, 'result')

        // if (result.length === 0) {
        //     return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 400);
        // }

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result.data, null, 200);
    },

}

module.exports = {
    ...orderUtil
}