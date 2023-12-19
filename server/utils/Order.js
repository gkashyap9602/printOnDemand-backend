require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const Gallery = require('../models/Gallery')
const Order = require('../models/Orders')
const Cart = require('../models/Cart')
const { default: mongoose } = require('mongoose');
const Orders = require('../models/Orders');
const json2csv = require('json2csv').parse;
const XLSX = require('xlsx')

const orderUtil = {

    addToCart: async (data, userId) => {
        try {
            let { cartItems } = data

            console.log(cartItems, "cartItemsss");
            //default cart item quantity is 1
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
            const cart = await Cart.findOne({ userId: customerId })
                .populate({
                    path: "productLibraryVariantId",
                    // populate: {
                    //     path: 'productLibraryId', // Replace 'nestedField1' with the actual nested field
                    // }
                })
            console.log(cart, "carttt");

            if (!cart) {
                return helpers.showResponse(false, "Cart Is Empty", {}, null, 400);
            }

            let image = cart?.productLibraryVariantId?.productLibraryVarientImages[0]?.imageUrl ?? ""

            // const findCart = await getDataArray(Cart, { userId: customerId }, "", null, null, null)
            // if (!findCart.status) {
            //     return helpers.showResponse(false, "Cart Is Empty", {}, null, 400);
            // }

            // let productVarientIds = findCart.data.map((value) => value.productLibraryVariantId)
            // console.log(productVarientIds, "idssss");

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

            // console.log(newOrderItem, "newOrderItem");


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
                image: image,
                shippingAccountNumber,
                orderDate: helpers.getCurrentDate()
            }

            let orderRef = new Order(obj)

            let response = await postData(orderRef);
            console.log(response, "responsee");
            if (response.status) {

                let removeItem = await deleteData(Cart, { userId: customerId })

                return helpers.showResponse(true, ResponseMessages.order.order_created, null, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages.order.order_failed, response?.data, null, 400);
        } catch (error) {
            console.log(error, "error side");
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },

    updateOrder: async (data, customerId) => {
        try {
            let { orderId, totalAmount, orderItems, shippingMethodId, orderType, billingAddress, shippingAddress, ioss, receipt, preship, shippingAccountNumber } = data

            const findOrder = await getSingleData(Orders, { _id: orderId, customerId: customerId })
            if (!findOrder.status) {
                return helpers.showResponse(false, "Order Not Exist", {}, null, 400);
            }

            let updatedData = {
                amount: totalAmount,
                shippingMethodId,
                orderType,
                billingAddress,
                shippingAddress,
                orderItems: orderItems,
                // ioss,
                receipt,
                preship,
                shippingAccountNumber,
                updatedOn: helpers.getCurrentDate()
            }

            let response = await updateSingleData(Orders, updatedData, { _id: orderId, customerId: customerId });
            // console.log(response, "responsee");

            if (response.status) {
                return helpers.showResponse(true, ResponseMessages.order.order_updated, null, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages.order.order_update_error, response?.data, null, 400);
        } catch (error) {
            // console.log(error, "error side");
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    updateOrderStatus: async (data) => {
        try {
            let { orderId, orderStatus } = data

            let updateObj = {
                updatedOn: helpers.getCurrentDate(),
                status: orderStatus
            }

            const result = await updateSingleData(Order, updateObj, { _id: orderId })
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, {}, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    ordersBulkImport: async (data, userId, file) => {
        try {
            let { SubmitImmediately } = data

            const buffer = file.buffer;
            const workbook = XLSX.read(buffer, { type: 'buffer' });

            const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
            const worksheet = workbook.Sheets[sheetName];

            // console.log(workbook, "workbook");
            // console.log(sheetName, "sheetName");
            // console.log(worksheet, "worksheet");
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

            console.log(rows,"rowsss==");
            // Assuming the columns are in order: product, quantity, price, etc.
            rows.forEach((row, rowIndex) => {
/////gfuidfedf
                // console.log(row, "rowwwwwwww");
                const cust_Id = row[0];
                const company_name = row[1];
                const customer_name = row[2];

                // Create an order or perform other actions with the data
                const order = {
                    cust_Id,
                    company_name,
                    customer_name,
                    // total: quantity * price,
                };

                // You can perform further actions with the order, such as saving to a database
                console.log(`Order ${rowIndex + 1}:`, order);
            });


            return helpers.showResponse(false, "Excel Upload Failed", null, null, 400);
        } catch (error) {
            console.log(error, "error side");
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    downloadOrderDetails: async (data, userId, res) => {
        try {
            let { orderIds } = data

            orderIds = orderIds?.map((id) => mongoose.Types.ObjectId(id))

            console.log(orderIds, "orderIds");
            const result = await Order.aggregate([
                {
                    $match: {
                        customerId: mongoose.Types.ObjectId(userId),
                        _id: { $in: orderIds }
                    }
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
                                    email: 1,
                                    phoneNumber: 1

                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'shipMethod',
                        localField: 'shippingMethodId',
                        foreignField: '_id',
                        as: 'shipMethodData',

                    }
                },
                {
                    $unwind: "$userData"
                }
            ])

            console.log(result, "resulttt");

            if (result.length === 0) {
                return helpers.showResponse(false, "Details Not available", {}, null, 400);
            }

            const sheet = await helpers.exportExcel(result)

            console.log(sheet, "sheet")

            return helpers.showResponse(true, "Download Success", sheet?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },

    getAllOrders: async (data, userId) => {
        let { pageIndex = 1, pageSize = 10, searchKey = '', sortColumn = "orderDate", orderType = null, sortDirection = "asc", createdFrom = null, createdTill = null, status = null, storeIds = [] } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        console.log(userId, "userIddddd");
        let matchObj = {
            customerId: mongoose.Types.ObjectId(userId),

        }
        if (status) {
            status = Number(status)
            matchObj.status = status
        }
        if (orderType) {
            orderType = Number(orderType)
            matchObj.orderType = orderType
        }
        console.log(searchKey, "searchKeysearchKey");
        let searchObj = {}
        if (searchKey) {
            searchKey = searchKey.toString()
            searchObj = {
                $or: [
                    { displayId: { $regex: searchKey, $options: 'i' } },
                    { mwwOrderId: { $regex: searchKey, $options: 'i' } },
                ]
            }

        }

        if (createdFrom && createdTill) {
            matchObj.orderDate = { $gte: createdFrom, $lte: createdTill }
        }

        console.log(matchObj, "matchObjjj");
        console.log(searchObj, "searchObj");
        const result = await Order.aggregate([
            {
                $match: {
                    ...matchObj,
                    ...searchObj

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
                        // {
                        //     $match: {
                        //         $or: [{ firstName: { $regex: searchKey, $options: 'i' } }]
                        //     }
                        // },
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
            // {
            //     $match: {
            //         $or: [{ "userData.firstName": { $regex: searchKey, $options: 'i' } }]
            //     }
            // },
            {
                $addFields: {
                    productNames: "$orderItems.productTitle"
                }
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
                    submissionDueDate: 1,
                    productNames: 1,
                    image: 1

                }
            }
        ]
        );


        //status summary aggregation starts
        let newOrder = await Order.aggregate([
            {
                $match: {
                    customerId: userId,
                    status: 1
                }
            },
            {
                $group: {
                    _id: null,
                    newOrder: { $sum: 1 }
                }
            }
        ])
        let cancelledOrder = await Order.aggregate([
            {
                $match: {
                    customerId: userId,
                    status: 5
                }
            },
            {
                $group: {
                    _id: null,
                    cancelledOrder: { $sum: 1 }
                }
            }
        ])
        let errorOrder = await Order.aggregate([
            {
                $match: {
                    customerId: userId,
                    status: 5
                }
            },
            {
                $group: {
                    _id: null,
                    errorOrder: { $sum: 1 }
                }
            }
        ])
        let inProductionOrder = await Order.aggregate([
            {
                $match: {
                    customerId: userId,
                    status: 2
                }
            },
            {
                $group: {
                    _id: null,
                    inProductionOrder: { $sum: 1 }
                }
            }
        ])
        let receivedOrder = await Order.aggregate([
            {
                $match: {
                    customerId: userId,
                    status: 6
                }
            },
            {
                $group: {
                    _id: null,
                    receivedOrder: { $sum: 1 }
                }
            }
        ])
        let shippedOrder = await Order.aggregate([
            {
                $match: {
                    customerId: userId,
                    status: 3
                }
            },
            {
                $group: {
                    _id: null,
                    shippedOrder: { $sum: 1 }
                }
            }
        ])
        let totalOrder = await Order.aggregate([
            {
                $match: {
                    customerId: userId,
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrder: { $sum: 1 }
                }
            }
        ])
        //status summary aggregation ends

        let statusSummary = {
            cancelled: cancelledOrder.length > 0 ? cancelledOrder[0].cancelledOrder : 0,
            error: errorOrder.length > 0 ? errorOrder[0].errorOrder : 0,
            inProduction: inProductionOrder.length > 0 ? inProductionOrder[0].inProductionOrder : 0,
            new: newOrder.length > 0 ? newOrder[0].newOrder : 0,
            received: receivedOrder.length > 0 ? receivedOrder[0].receivedOrder : 0,
            shipped: shippedOrder.length > 0 ? shippedOrder[0].shippedOrder : 0,
            totalOrders: totalOrder.length > 0 ? totalOrder[0].totalOrder : 0,
        }
        let total = await getCount(Order, matchObj)
        let totalCount = total.data

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, { orders: result, statusSummary, totalCount }, null, 200);
    },
    getAllUserOrders: async (data) => {
        let { pageIndex = 1, pageSize = 10, searchKey = '', sortColumn = "orderDate", orderType = null, sortDirection = "asc", createdFrom = null, createdTill = null, source = '' } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        let matchObj = {}

        if (orderType) {
            orderType = Number(orderType)
            matchObj.orderType = orderType
        }
        console.log(searchKey, "searchKeysearchKey");
        let searchObj = {}
        if (searchKey) {
            searchKey = searchKey.toString()
            searchObj = {
                $or: [
                    { displayId: { $regex: searchKey, $options: 'i' } },
                    { mwwOrderId: { $regex: searchKey, $options: 'i' } },
                ]
            }

        }

        if (createdFrom && createdTill) {
            matchObj.orderDate = { $gte: createdFrom, $lte: createdTill }
        }

        console.log(matchObj, "matchObjjj");
        console.log(searchObj, "searchObj");
        const result = await Order.aggregate([
            {
                $match: {
                    ...matchObj,
                    ...searchObj

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
                        // {
                        //     $match: {
                        //         $or: [{ firstName: { $regex: searchKey, $options: 'i' } }]
                        //     }
                        // },
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
            // {
            //     $match: {
            //         $or: [{ "userData.firstName": { $regex: searchKey, $options: 'i' } }]
            //     }
            // },
            {
                $addFields: {
                    productNames: "$orderItems.productTitle"
                }
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
                    submissionDueDate: 1,
                    productNames: 1

                }
            }
        ]
        );

        let total = await getCount(Order, matchObj)
        let totalCount = total.data

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, { orders: result, totalCount }, null, 200);
    },
    getOrderDetails: async (data, userId) => {
        let { orderId } = data

        const result = await Order.aggregate([
            {
                $match: {
                    customerId: mongoose.Types.ObjectId(userId),
                    _id: mongoose.Types.ObjectId(orderId),
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
                $addFields: {
                    customerName: "$userData.firstName",
                    shipMethodName: "$ShipMethodData.name"
                }
            },
            {
                $project: {
                    userData: 0, // Exclude the userData array from the result
                    ShipMethodData: 0 // Exclude the ShipMethodData array from the result
                }
            }
        ]
        );

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result.length > 0 ? result[0] : result, null, 200);
    },
    getUserOrderDetails: async (data, userId) => {
        let { orderId } = data

        const result = await Order.aggregate([
            {
                $match: {
                    // customerId: mongoose.Types.ObjectId(userId),
                    _id: mongoose.Types.ObjectId(orderId),
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
                $addFields: {
                    customerName: "$userData.firstName",
                    shipMethodName: "$ShipMethodData.name"
                }
            },
            {
                $project: {
                    userData: 0, // Exclude the userData array from the result
                    ShipMethodData: 0 // Exclude the ShipMethodData array from the result
                }
            }
        ]
        );

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result.length > 0 ? result[0] : result, null, 200);
    },
    getCartItems: async (data, userId) => {
        let { pageIndex = 1, pageSize = 5 } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        const aggregationPipeline = [
            {
                $match: {
                    status: { $ne: 2 },
                    userId: mongoose.Types.ObjectId(userId)
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