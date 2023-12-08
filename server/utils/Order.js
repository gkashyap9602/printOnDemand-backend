require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const Gallery = require('../models/Gallery')
const Order = require('../models/Orders')
const Cart = require('../models/Cart')
const { default: mongoose } = require('mongoose');

const orderUtil = {

    addToCart: async (data, userId) => {
        try {
            let { cartItems } = data

            // let alreadyCartItem
            // let newCartItem
            cartItems.map((value) => value.createdOn = helpers.getCurrentDate())
            cartItems.map((value) => value.userId = userId)

            for (let item of cartItems) {

                let find = await getSingleData(Cart, { productLibraryVariantId: item.productLibraryVariantId });
                if (find.status) {
                    let quantity = find.data.quantity
                    let updateItem = await updateSingleData(Cart, { quantity: quantity + 1 });
                    if (!updateItem.status) {
                        return helpers.showResponse(false, ResponseMessages.common.save_failed, null, null, 400);
                    }
                } else {
                    let cartRef = new Cart(item)
                    let response = await postData(cartRef);
                    if (!response.status) {
                        return helpers.showResponse(false, ResponseMessages.common.save_failed, null, null, 400);
                    }
                }


            }
            return helpers.showResponse(true, ResponseMessages.common.added_success, null, null, 200);
            // let response = await insertMany(Cart, cartItems);
            // if (response.status) {
            //     return helpers.showResponse(true, ResponseMessages.common.added_success, null, null, 200);
            // }
            // return helpers.showResponse(false, ResponseMessages.common.save_failed, null, null, 400);
        } catch (error) {
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    placeOrder: async (data, customerId) => {
        try {
            let { totalAmount, orderItems, submitImmediately, shippingMethodId, orderType, billingAddress, shippingAddress, cartItems, ioss, receipt, preship, shippingAccountNumber, } = data

            const fixedPrefix = 'MWW1000';
            const randomId = helpers.generateRandom4DigitNumber(fixedPrefix);

            // let populate = "productLibraryVariantId"
            const findCart = await getDataArray(Cart, { userId: customerId }, "", null, null, null)
            if (!findCart.status) {
                return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
            }
            // let orderAmount = findCart.data.map((value) => {
            //     let qty = value.quantity
            //     let price = value.productLibraryVariantId.price
            //     let amount = Number(qty) * Number(price)
            //     return amount
            // })
            // // console.log(orderAmount, "orderAmount");
            // let totalAmount = orderAmount.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            // console.log(totalAmount, "totalAmount");

            let productVarientIds = findCart.data.map((value) => value.productLibraryVariantId)
            console.log(productVarientIds, "idssss");

            let newOrderItem = orderItems.map((value) => {
                let obj = value
                let itm = value.productVarientOptions.map((val) => {
                    return {
                        productVariableOptionId: val._id,
                        optionValue: val.value,
                        productVariableTypeId: val.variableTypeId,
                        typeName: val.variableTypeName
                    }
                })
                obj.productVarientOptions = itm

                return obj

            })

            console.log(newOrderItem, "newOrderItem");


            let obj = {
                customerId: customerId,
                // productLibraryVarientIds: productVarientIds,
                amount: totalAmount,
                displayId: randomId,
                submitImmediately,
                shippingMethodId,
                orderType,
                billingAddress,
                shippingAddress,
                cartItems,
                orderItems: newOrderItem,
                ioss,
                receipt,
                preship,
                shippingAccountNumber

            }
            let orderRef = new Order(obj)

            let response = await postData(orderRef);
            console.log(response, "responsee");
            if (response.status) {
                return helpers.showResponse(true, ResponseMessages.order.order_created, null, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages.order.order_failed, null, null, 400);
        } catch (error) {
            console.log(error, "error side");
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    getAllOrderss: async (data) => {
        let { pageIndex = 1, pageSize = 10, customerId, sortColumn = "orderDate", sortDirection = "asc", status, storeIds = [] } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        let result = [
            {
                _id: "12345465",
                amount: 25.19,
                customerName: "Sunil",
                displayId: "MWW10004517",
                isSubmitImmediately: true,
                mwwOrderId: "",
                orderDate: "2023-12-08T07:18:12.977000",
                orderType: 2,
                status: 1,
                storeName: null,
                source: "",
                submissionDueDate: "2023-12-08T07:18:12.977000"
            },
            {
                _id: "12345465",
                amount: 21.19,
                customerName: "Sunil",
                displayId: "MWW10004537",
                isSubmitImmediately: true,
                mwwOrderId: "",
                orderDate: "2023-12-08T07:18:12.977000",
                orderType: 2,
                status: 1,
                storeName: null,
                source: "",
                submissionDueDate: "2023-12-08T07:18:12.977000"
            },
            {
                _id: "12345465",
                amount: 452.19,
                customerName: "Sunil",
                displayId: "MWW10004599",
                isSubmitImmediately: true,
                mwwOrderId: "",
                orderDate: "2023-12-08T07:18:12.977000",
                orderType: 2,
                status: 1,
                storeName: null,
                source: "",
                submissionDueDate: "2023-12-08T07:18:12.977000"
            },
            {
                _id: "12345465",
                amount: 81.19,
                customerName: "Sunil",
                displayId: "MWW10004522",
                isSubmitImmediately: true,
                mwwOrderId: "",
                orderDate: "2023-12-08T07:18:12.977000",
                orderType: 2,
                status: 1,
                storeName: null,
                source: "",
                submissionDueDate: "2023-12-08T07:18:12.977000"
            }
        ]
        let statusSummary = {
            cancelled: 0,
            error: 1,
            inProduction: 0,
            new: 2,
            received: 0,
            shipped: 1
        }
        let totalCount = 4
        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, { orders: result, statusSummary, totalCount }, null, 200);
    },
    getAllOrders: async (data) => {
        let { pageIndex = 1, pageSize = 10, customerId, sortColumn = "orderDate", sortDirection = "asc", status, storeIds = [] } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        const result = await Order.aggregate([
            {
                $match: {
                    customerId: mongoose.Types.ObjectId(customerId)
                }
            },

            {
                $skip: (pageIndex - 1) * pageSize // Skip records based on the page number
            },
            {
                $limit: pageSize // Limit the number of records per page
            },
            {
                $sort: {
                    [sortColumn]: sortDirection === "asc" ? 1 : -1
                }
            },
            {
                $lookup: {
                    from: 'shipMethod',
                    localField: 'shippingMethodId',
                    foreignField: '_id',
                    as: 'ShipMethodData',
                }

            },
            {
                $unwind: "$ShipMethodData"
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'userData',
                    pipeline: [
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                payTraceId: 1,
                                // traceId:1,

                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$userData"
            },

            {
                $project: {
                    amount: 1,
                    customerName: "$userData.firstName",
                    displayId: 1,
                    isSubmitImmediately: 1,
                    mwwOrderId: 1,
                    orderDate: 1,
                    orderType: 1,
                    source: 1,
                    status: 1,
                    storeName: 1,
                    submissionDueDate: 1

                }
            }
        ]);
        let statusSummary = {
            cancelled: 0,
            error: 1,
            inProduction: 0,
            new: 2,
            received: 0,
            shipped: 1
        }
        totalCount = 5

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, { orders: result, statusSummary, totalCount }, null, 200);
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
                                            variableOptionData: 1
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

        ];

        const result = await Cart.aggregate(aggregationPipeline);

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result, null, 200);
    },
    removeItemsFromCart: async (data) => {
        let { userId } = data

        let removeItem = await deleteData(Cart, { userId: userId })
        if (removeItem.status) {
            return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages.common.database_error, {}, null, 400);
    },


    updateCartItem: async (data) => {
        try {
            let { cartId, quantity } = data
            let updateDataObj = {
                quantity,
                updatedOn: helpers.getCurrentDate()
            }

            let matchObj = {
                _id: cartId,
            }


            const response = await updateSingleData(Cart, updateDataObj, matchObj)
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

    deleteCart: async (data) => {
        try {
            const { cartId, } = data

            const find = await getSingleData(Cart, { _id: cartId })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
            }


            const result = await deleteById(Cart, { _id: cartId })

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },


}

module.exports = {
    ...orderUtil
}