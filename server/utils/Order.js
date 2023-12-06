require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const Gallery = require('../models/Gallery')
const Order = require('../models/Orders')
const Cart = require('../models/Cart')
const orderUtil = {

    addToCart: async (data) => {

        try {
            let { cartItems, quantity } = data

            let newObj = {
                cartItems,
                createdOn: helpers.getCurrentDate()
            }

            let cartRef = new Cart(newObj)
            let response = await postData(cartRef);
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

    // getGallery: async (data) => {
    //     let { type, pageIndex = 1, pageSize = 5 } = data
    //     pageIndex = Number(pageIndex)
    //     pageSize = Number(pageSize)

    //     let totalCount = await getCount(Gallery, { status: { $ne: 2 }, type: Number(type) })
    //     const aggregationPipeline = [

    //         {
    //             $match: {
    //                 status: { $ne: 2 },
    //                 type: Number(type)
    //             },
    //         },
    //         {
    //             $skip: (pageIndex - 1) * pageSize // Skip records based on the page number
    //         },
    //         {
    //             $limit: pageSize // Limit the number of records per page
    //         },
    //     ];


    //     const result = await Gallery.aggregate(aggregationPipeline);

    //     return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, { items: result, totalCount: totalCount?.data }, null, 200);
    // },

}

module.exports = {
    ...orderUtil
}