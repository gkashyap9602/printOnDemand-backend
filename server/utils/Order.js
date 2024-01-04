require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const Gallery = require('../models/Gallery')
const Order = require('../models/Orders')
const Cart = require('../models/Cart')
const { default: mongoose } = require('mongoose');
const Orders = require('../models/Orders');
const OrderItems = require('../models/OrderItems')
const ProductVarient = require('../models/ProductVarient')
const Users = require('../models/Users')
const UserProfile = require('../models/UserProfile')
const json2csv = require('json2csv').parse;
const XLSX = require('xlsx')
const BulkImportRequest = require('../models/BulkImportRequest')
const ShipMethod = require('../models/ShipMethod')
const fs = require('fs')
const consts = require('../constants/const')
const excelToJson = require('convert-excel-to-json')

const orderUtil = {

    addToCart: async (data, userId) => {
        try {
            let { cartItems } = data

            let findUser = await getSingleData(Users, { _id: userId }, 'status')

            if (!findUser.status) {
                return helpers.showResponse(false, ResponseMessages.users.account_not_exist, null, null, 400);
            }
            //If user is not activated then he cannot place orders
            if (findUser?.data?.status === 3) {
                return helpers.showResponse(false, ResponseMessages.users.account_not_active, null, null, 400);
            }

            console.log(cartItems, "cartItemsss");
            //default cart item quantity is 1
            cartItems.map((value) => value.createdOn = helpers.getCurrentDate())
            cartItems.map((value) => value.userId = userId)

            //
            let updateItems = []
            let newItems = []


            for (let item of cartItems) {

                let find = await getSingleData(Cart, { userId: userId, productLibraryVariantId: item.productLibraryVariantId });

                //if cart item already push into  updateItem array with quantity increase
                if (find.status) {
                    let quantity = Number(find.data.quantity) + 1
                    item.quantity = quantity
                    updateItems.push(item)


                    //if cart item not already exist push into  new ItemmArry
                } else {
                    newItems.push(item)

                }
            }

            // console.log(updateItems, "updateItems");
            // console.log(newItems, "newItems");

            //if item already exist in cart then increase quantity and bulk update in database 
            if (updateItems.length > 0) {

                // console.log(updateItems, "if length updateItems");
                const bulkOperations = updateItems.map(({ productLibraryVariantId, quantity }) => ({
                    updateOne: {
                        filter: { productLibraryVariantId: productLibraryVariantId, userId: userId },
                        update: { $set: { quantity: quantity } }
                    }
                }));

                //update items in bulk
                // const result = await Cart.bulkWrite(bulkOperations);
                let result = await bulkOperationQuery(Cart, bulkOperations)

                if (result.status) {
                    return helpers.showResponse(true, ResponseMessages.common.added_success, null, null, 200);
                } else {
                    return helpers.showResponse(false, ResponseMessages.order.addToCart_failed, null, null, 400);

                }


            }
            //if item not already exist in cart then insert items in database 
            if (newItems.length > 0) {
                let response = await insertMany(Cart, newItems);
                // console.log(response, "responseresponse");
                if (!response.status) {
                    return helpers.showResponse(false, ResponseMessages.order.addToCart_failed, null, null, 400);
                }

                return helpers.showResponse(true, ResponseMessages.common.added_success, null, null, 200);

            }

        } catch (error) {
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    placeOrder: async (data, customerId) => {
        try {
            let { totalAmount, orderItems, submitImmediately, shippingMethodId, orderType, billingAddress, shippingAddress, cartItems, ioss, receipt, preship, shippingAccountNumber, } = data

            const fixedPrefix = 'MWW1000';
            let countOrders = await getCount(Orders, {})
            const randomId = await helpers.generateOrderID(fixedPrefix, countOrders.data);
            console.log(randomId, "randomId");

            const allCartItems = await getDataArray(Cart, { userId: customerId })

            if (!allCartItems.status || allCartItems?.data?.length === 0) {
                return helpers.showResponse(false, "Cart Is Empty", {}, null, 400);
            }

            //order payload
            let obj = {
                customerId: customerId,
                amount: totalAmount,
                displayId: randomId,
                isSubmitImmediately: submitImmediately,
                shippingMethodId,
                orderType,
                billingAddress,
                shippingAddress,
                ioss,
                receipt,
                preship,
                shippingAccountNumber,
                orderDate: helpers.getCurrentDate()
            }

            let orderRef = new Order(obj)

            let response = await postData(orderRef);
            console.log(response, "responsee Order");
            //if order placed success then create order items
            if (response.status) {

                //aggregate on cart items and populate product data and save in orderItems Table
                let orderItemss = await Cart.aggregate([
                    {
                        $match: {
                            userId: mongoose.Types.ObjectId(customerId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'productLibraryVarient',
                            localField: 'productLibraryVariantId',
                            foreignField: '_id',
                            as: 'productLibraryVarientData',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'productLibrary',
                                        localField: 'productLibraryId',
                                        foreignField: '_id',
                                        as: 'productLibraryData',
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$productLibraryData", //productVareintId has single Product varient details 
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'productVarient',
                                        localField: 'productVarientId',
                                        foreignField: '_id',
                                        as: 'productVarientData',  //fetch product varient data 
                                        pipeline: [
                                            {
                                                $lookup: {
                                                    from: "variableOptions",
                                                    localField: "varientOptions.variableOptionId",
                                                    foreignField: "_id",
                                                    as: "variableOptionData",//fetch variable Option data 
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

                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$productVarientData", //productVareintId has single Product varient details 
                                        preserveNullAndEmptyArrays: true
                                    }
                                }

                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$productLibraryVarientData", //productLibraryVareintId has productLibraryId and productVarient id and both has single varient and product details 
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            _id: 1,//cartid
                            // userId: 1,
                            orderId: response?.data?._id,
                            productLibraryVarientId: "$productLibraryVariantId",
                            // productVarientId: "$productLibraryVarientData.productVarientId",
                            quantity: 1,
                            productCode: "$productLibraryVarientData.productVarientData.productCode",
                            // productTitle: "$productLibraryVarientData.productLibraryData.title",
                            // productImages: "$productLibraryVarientData.productLibraryVarientImages",
                            orderedPrice: "$productLibraryVarientData.price",
                            createdOn: helpers.getCurrentDate()
                        }

                    }
                ])
                //ends of aggregation

                //creating order items payload
                // let newOrderItems = orderItems.map((value) => {
                //     let obj = value
                //     obj.orderId = response?.data?._id
                //     // let itm = value.productVarientOptions.map((val) => {
                //     //     return {
                //     //         productVariableOptionId: val._id,
                //     //         optionValue: val.value,
                //     //         productVariableTypeId: val.variableTypeId,
                //     //         typeName: val.variableTypeName
                //     //     }
                //     // })
                //     // obj.productVarientOptions = itm

                //     return obj

                // })

                // console.log(newOrderItems, "newOrderItems");

                let resultOrderItems = await insertMany(OrderItems, orderItemss)

                //if order Item created then remove items from cart 
                if (resultOrderItems.status) {

                    //remove cart items of a user after successfull order placed
                    let removeItem = await deleteData(Cart, { userId: customerId })

                    return helpers.showResponse(true, ResponseMessages.order.order_created, null, null, 200);

                }
                //if failed to create order items then delete order create earliar
                let removeOrder = await deleteById(Order, response?.data?._id)

                return helpers.showResponse(false, ResponseMessages.order.order_failed, null, null, 400);

            }

            return helpers.showResponse(false, ResponseMessages.order.order_failed, null, null, 400);
        } catch (error) {
            console.log(error, "error side");
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    // placeOrder: async (data, customerId) => {
    //     try {
    //         let { totalAmount, orderItems, submitImmediately, shippingMethodId, orderType, billingAddress, shippingAddress, cartItems, ioss, receipt, preship, shippingAccountNumber, } = data

    //         // let findUser = await getSingleData(Users, { _id: customerId }, 'status')

    //         // if (!findUser.status) {
    //         //     return helpers.showResponse(false, ResponseMessages.users.account_not_exist, null, null, 400);
    //         // }
    //         // //If user is not activated then he cannot place orders
    //         // if (findUser?.data?.status === 3) {
    //         //     return helpers.showResponse(false, ResponseMessages.users.account_not_active, null, null, 400);
    //         // }
    //         const fixedPrefix = 'MWW1000';
    //         let countOrders = await getCount(Orders, {})
    //         const randomId = await helpers.generateOrderID(fixedPrefix, countOrders.data);

    //         console.log(randomId, "randomId");
    //         const cart = await Cart.findOne({ userId: customerId })
    //             .populate({
    //                 path: "productLibraryVariantId",
    //                 // populate: {
    //                 //     path: 'productLibraryId', // Replace 'nestedField1' with the actual nested field
    //                 // }
    //             })
    //         // console.log(cart, "carttt");

    //         if (!cart) {
    //             return helpers.showResponse(false, "Cart Is Empty", {}, null, 400);
    //         }


    //         // const findCart = await getDataArray(Cart, { userId: customerId }, "", null, null, null)
    //         // if (!findCart.status) {
    //         //     return helpers.showResponse(false, "Cart Is Empty", {}, null, 400);
    //         // }

    //         // let productVarientIds = findCart.data.map((value) => value.productLibraryVariantId)
    //         // console.log(productVarientIds, "idssss");

    //         let newOrderItem = orderItems.map((value) => {
    //             let obj = value
    //             let itm = value.productVarientOptions.map((val) => {
    //                 return {
    //                     productVariableOptionId: val._id,
    //                     optionValue: val.value,
    //                     productVariableTypeId: val.variableTypeId,
    //                     typeName: val.variableTypeName
    //                 }
    //             })
    //             obj.productVarientOptions = itm

    //             return obj

    //         })

    //         // console.log(newOrderItem, "newOrderItem");


    //         let obj = {
    //             customerId: customerId,
    //             // productLibraryVarientIds: productVarientIds,
    //             amount: totalAmount,
    //             displayId: randomId,
    //             isSubmitImmediately: submitImmediately,
    //             shippingMethodId,
    //             orderType,
    //             billingAddress,
    //             shippingAddress,
    //             cartItems,
    //             orderItems: newOrderItem,
    //             ioss,
    //             receipt,
    //             preship,
    //             shippingAccountNumber,
    //             orderDate: helpers.getCurrentDate()
    //         }

    //         let orderRef = new Order(obj)

    //         let response = await postData(orderRef);
    //         console.log(response, "responsee");
    //         if (response.status) {

    //             let removeItem = await deleteData(Cart, { userId: customerId })

    //             return helpers.showResponse(true, ResponseMessages.order.order_created, null, null, 200);
    //         }
    //         return helpers.showResponse(false, ResponseMessages.order.order_failed, {}, null, 400);
    //     } catch (error) {
    //         console.log(error, "error side");
    //         return helpers.showResponse(false, error?.message, null, null, 400);

    //     }

    // },
    updateOrder: async (data, customerId) => {
        try {
            let { orderId, totalAmount, orderItems, shippingMethodId, orderType, billingAddress, shippingAddress, ioss, receipt, preship, shippingAccountNumber } = data

            const findOrder = await getSingleData(Orders, { _id: orderId, customerId })
            if (!findOrder.status) {
                return helpers.showResponse(false, ResponseMessages.order.order_not_exist, {}, null, 400);
            }

            // update Order Payload
            let updateOrderData = {
                amount: totalAmount,
                shippingMethodId,
                orderType,
                billingAddress,
                shippingAddress,
                orderItems: orderItems,
                ioss,
                receipt,
                preship,
                shippingAccountNumber,
                updatedOn: helpers.getCurrentDate()
            }

            //update order
            let response = await updateSingleData(Orders, updateOrderData, { _id: orderId, customerId });

            //if order update sucess then update order Items  
            if (response.status) {
                // console.log(response,"responsee");

                //create bulk operation for update order items
                const bulkOperations = orderItems?.map((item) => ({ //_id is orderItem id 
                    updateOne: {
                        filter: { _id: item?._id, orderId: orderId },
                        update: { $set: { ...item } } //update every feild that is present in order items
                    }
                }));

                let orderItemsUpdate = await bulkOperationQuery(OrderItems, bulkOperations)

                //if order Items udpated then show success response
                if (orderItemsUpdate.status) {
                    return helpers.showResponse(true, ResponseMessages.order.order_updated, null, null, 200);
                }
                return helpers.showResponse(false, ResponseMessages.order.order_update_error, null, null, 400);

            }
            return helpers.showResponse(false, ResponseMessages.order.order_update_error, null, null, 400);
        } catch (error) {
            // console.log(error, "error side");
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },

    // updateOrder: async (data, customerId) => {
    //     try {
    //         let { orderId, totalAmount, orderItems, shippingMethodId, orderType, billingAddress, shippingAddress, ioss, receipt, preship, shippingAccountNumber } = data

    //         const findOrder = await getSingleData(Orders, { _id: orderId, customerId: customerId })
    //         if (!findOrder.status) {
    //             return helpers.showResponse(false, ResponseMessages.order.order_not_exist, {}, null, 400);
    //         }

    //         let updatedData = {
    //             amount: totalAmount,
    //             shippingMethodId,
    //             orderType,
    //             billingAddress,
    //             shippingAddress,
    //             orderItems: orderItems,
    //             // ioss,
    //             receipt,
    //             preship,
    //             shippingAccountNumber,
    //             updatedOn: helpers.getCurrentDate()
    //         }

    //         let response = await updateSingleData(Orders, updatedData, { _id: orderId, customerId: customerId });

    //         if (response.status) {
    //             return helpers.showResponse(true, ResponseMessages.order.order_updated, null, null, 200);
    //         }
    //         return helpers.showResponse(false, ResponseMessages.order.order_update_error, response?.data, null, 400);
    //     } catch (error) {
    //         // console.log(error, "error side");
    //         return helpers.showResponse(false, error?.message, null, null, 400);

    //     }

    // },
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
    bulkImportOrders: async (data, userId, file) => {
        try {
            let { SubmitImmediately = true } = data

            let findUser = await getSingleData(UserProfile, { userId: userId })

            if (!findUser.status) {
                return helpers.showResponse(false, ResponseMessages?.users.account_not_exist, null, null, 203);
            }
            let billingAddress = findUser?.data?.billingAddress
            //save uploaded file with user reference 
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, null, null, 203);
            }

            let obj = {
                userId,
                uploadedFilePath: s3Upload?.data[0],
                createdOn: helpers.getCurrentDate()
            }
            let fileRef = new BulkImportRequest(obj)
            let saveUploadedFile = await postData(fileRef)

            if (!saveUploadedFile.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_save_error, null, null, 400);
            }

            // const result = excelToJson({
            //     sourceFile: fs.readFileSync(file.buffer)
            // });

            // console.log(result, "resultti");

            const buffer = file.buffer;
            const workbook = XLSX.read(buffer, { type: 'buffer' });

            const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
            const worksheet = workbook.Sheets[sheetName];

            const rowsData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });

            // Filter out rows with entirely null values
            const rows = rowsData.filter(row => row.some(value => value !== null));

            // Extract headers and data
            const headers = rows[0]; //this is the title of the file headers it should be constant

            const xlsx_dataa = rows.slice(1); //index 0 represents the first line data of the file after headers

            console.log(headers, "headers");
            // console.log(xlsx_data, "xlsx_data");


            //final total orders array the is ready to be placed
            let bulkOrders = []

            //iterate on each row 
            xlsx_dataa?.forEach((data, rowIndex) => { //rowIndex represents rows that has data
                //object for create order object key value
                let excelOrder = {}

                //iterate on each header and assign its corrosponding value to header key example shipMethos = "GS1"
                let result = headers.forEach((header, index) => {
                    let removedSpaceHeader = header?.replace(/ /g, "").replace('/', '').replace('#', '') //remove extra space from headers

                    excelOrder[removedSpaceHeader] = xlsx_dataa[rowIndex][index] ?? ""

                    // excelOrder.productCode = xlsx_dataa[rowIndex]?.Item,
                    // excelOrder.upc = xlsx_dataa[rowIndex]?.UPCSKU,
                    // excelOrder.orderedPrice = "",
                    // excelOrder.quantity = xlsx_dataa[rowIndex]?.Quantity,
                    // excelOrder.hsCode = xlsx_dataa[rowIndex]?.HSCODE,
                    // excelOrder.declaredValue = xlsx_dataa[rowIndex]?.DeclaredValue,
                    // excelOrder.backImagePlacement = xlsx_dataa[rowIndex]?.BackImagePlacement,
                    // excelOrder.backImageUrl = xlsx_dataa[rowIndex]?.BackImageURL,
                    // excelOrder.imagePlacement = xlsx_dataa[rowIndex]?.ImagePlacement,
                    // excelOrder.designUrl = xlsx_dataa[rowIndex]?.URLFileName,
                })

                //push each order key value data in bulk order array   
                bulkOrders.push(excelOrder)

            })
            //ends
            // findProductCodes?.data?.filter((data) => data?.productCode == itm?.Item)[0]?.price

            //check valid data in excel file or not
            //---------------------------------------------------------------------------------------------------------------
            let productCodes = bulkOrders?.map(({ Item }) => Item)
            //productCodes can be same in line items in excel so find unique than add check if it exist or not 
            let uniqueProductCodes = [...new Set(productCodes)]

            //shipMethods can be same in line items in excel so find unique than add check if it exist or not 
            let shipMethods = bulkOrders?.map(({ ShipMethod }) => ShipMethod)
            let uniqueShipMethods = [...new Set(shipMethods)]


            console.log(uniqueProductCodes, "uniqueProductCodes");
            console.log(uniqueShipMethods, "uniqueShipMethods");

            //find product Code exist or not 
            const findProductCodes = await getDataArray(ProductVarient, { productCode: { $in: uniqueProductCodes }, status: { $ne: 2 } })

            if (findProductCodes?.data?.length !== uniqueProductCodes?.length) {
                return helpers.showResponse(false, ResponseMessages?.product.invalid_product_code, {}, null, 400);
            }

            //find ship method exist or not 
            const findShipMethods = await getDataArray(ShipMethod, { shipMethod: { $in: uniqueShipMethods }, status: { $ne: 2 } })

            if (findShipMethods?.data?.length !== uniqueShipMethods?.length) {
                return helpers.showResponse(false, ResponseMessages?.product.invalid_ship_method, {}, null, 400);
            }
            //---------------------------------------------------------------------------------------------------------------
            //ends here
            const fixedPrefix = 'MWW1000';
            let countOrders = await getCount(Orders, {})
            const randomId = await helpers.generateOrderID(fixedPrefix, countOrders.data);


            //order Items payload
            let finalOrderItems = bulkOrders?.map((itm) => {
                let obj = {
                    // orderId: responseOrder?.data?._id,
                    productVarientId: findProductCodes?.data?.filter((data) => data?.productCode == itm?.Item)[0]?._id,
                    productCode: itm?.Item,
                    // upc: itm?.UPCSKU,
                    orderedPrice: findProductCodes?.data?.filter((data) => data?.productCode == itm?.Item)[0]?.price,
                    quantity: itm?.Quantity,
                    // hsCode: itm?.HSCODE,
                    // declaredValue: itm?.DeclaredValue,
                    // backImagePlacement: itm?.BackImagePlacement,
                    // backImageUrl: itm?.BackImageURL,
                    // imagePlacement: itm?.ImagePlacement,
                    // designUrl: itm?.URLFileName,
                    createdOn: helpers.getCurrentDate()
                }
                return obj
            })
            //uu

            console.log(finalOrderItems, "finalOrderItems");

            let totalAmount = finalOrderItems.map((itm) => itm?.orderedPrice * itm?.quantity).reduce((acc, curr) => acc + curr).toFixed(2)
            console.log(totalAmount, "totalAmount");

            //Create Order With Order Paylaod
            //-------------------------------------------------------------
            let mainOrderPayload = {
                customerId: userId,
                shippingMethodId: findShipMethods?.data?.filter((itm) => itm?.shipMethod == bulkOrders[0]?.ShipMethod)[0]?._id,
                bulkImportRequestId: saveUploadedFile?.data?._id, //save bulk import id excel file
                displayId: randomId,
                source: 5,//5 used for excel upload
                amount: totalAmount, //total amount of orderItems
                isSubmitImmediately: SubmitImmediately,
                receipt: bulkOrders[0]?.Receipt ?? '',
                preship: bulkOrders[0]?.Preship ?? '',
                asin: bulkOrders[0]?.ASIN ?? null,
                ioss: bulkOrders[0]?.IOSS ?? null,
                shippingAccountNumber: bulkOrders[0]?.Ship3rdPartyAccount,
                shippingAddress: {
                    address1: bulkOrders[0]?.ShipAddr1 ?? null,
                    address2: bulkOrders[0]?.ShipAddr2 ?? null,
                    city: bulkOrders[0]?.ShipCity ?? null,
                    // companyEmail: "gkashyap9602@gmail.com",
                    // companyName: ShipName,
                    companyPhone: bulkOrders[0]?.ShipPhoneNumber ?? null,
                    contactName: bulkOrders[0]?.ShipName ?? null,
                    country: bulkOrders[0]?.ShipCountry ?? null,
                    stateName: bulkOrders[0]?.ShipState ?? null,
                    // taxId: "12345",
                    zipCode: bulkOrders[0]?.ShipZip ?? null
                },
                billingAddress: billingAddress, //fetch billing details from user profile
                orderDate: helpers.getCurrentDate()

            }

            let orderRef = new Order(mainOrderPayload)

            let responseOrder = await postData(orderRef)

            if (!responseOrder.status) {

                return helpers.showResponse(false, ResponseMessages.order.order_failed, null, null, 400);
            }
            //-------------------------------------------------------------
            //ends here
            // Adding the key to each object in the array
            finalOrderItems.forEach(item => {
                item['orderId'] = responseOrder?.data?._id;
            });


            let saveOrderItems = await insertMany(OrderItems, finalOrderItems)
            if (!saveOrderItems.status) {
                return helpers.showResponse(false, ResponseMessages.order.order_failed, null, null, 400);
            }


            console.log(bulkOrders, "bulkOrders");
            // console.log(result, "result");

            return helpers.showResponse(true, "bulk Import Success", {}, null, 200);
        } catch (error) {
            console.log(error, "error side");
            return helpers.showResponse(false, error?.message, null, null, 400);

        }

    },
    // ordersBulkImport: async (data, userId, file) => {
    //     try {
    //         let { SubmitImmediately = true } = data

    //         let findUser = await getSingleData(UserProfile, { userId: userId })

    //         if (!findUser.status) {
    //             return helpers.showResponse(false, ResponseMessages?.users.account_not_exist, null, null, 203);
    //         }
    //         let billingAddress = findUser?.data?.billingAddress
    //         //save uploaded file with user reference 
    //         const s3Upload = await helpers.uploadFileToS3([file])
    //         if (!s3Upload.status) {
    //             return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, null, null, 203);
    //         }

    //         let obj = {
    //             userId,
    //             uploadedFilePath: s3Upload?.data[0],
    //             createdOn: helpers.getCurrentDate()
    //         }
    //         let fileRef = new BulkImportRequest(obj)
    //         let saveUploadedFile = await postData(fileRef)

    //         if (!saveUploadedFile.status) {
    //             return helpers.showResponse(false, ResponseMessages?.common.file_save_error, null, null, 400);
    //         }

    //         // const result = excelToJson({
    //         //     sourceFile: fs.readFileSync(file.buffer)
    //         // });

    //         // console.log(result, "resultti");

    //         const buffer = file.buffer;
    //         const workbook = XLSX.read(buffer, { type: 'buffer' });

    //         const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
    //         const worksheet = workbook.Sheets[sheetName];

    //         const rowsData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });

    //         // Filter out rows with entirely null values
    //         const rows = rowsData.filter(row => row.some(value => value !== null));

    //         // Extract headers and data
    //         const headers = rows[0]; //this is the title of the file headers it should be constant

    //         const xlsx_dataa = rows.slice(1); //index 0 represents the first line data of the file after headers

    //         console.log(headers, "headers");
    //         // console.log(xlsx_data, "xlsx_data");


    //         //final total orders array the is ready to be placed
    //         let bulkOrders = []

    //         //iterate on each row 
    //         xlsx_dataa?.forEach((data, rowIndex) => { //rowIndex represents rows that has data
    //             //object for create order object key value
    //             let excelOrder = {}

    //             //iterate on each header and assign its corrosponding value to header key example shipMethos = "GS1"
    //             let result = headers.forEach((header, index) => {
    //                 let removedSpaceHeader = header?.replace(/ /g, "").replace('/', '').replace('#', '') //remove extra space from headers

    //                 excelOrder[removedSpaceHeader] = xlsx_dataa[rowIndex][index] ?? ""

    //                 // excelOrder.productCode = xlsx_dataa[rowIndex]?.Item,
    //                 // excelOrder.upc = xlsx_dataa[rowIndex]?.UPCSKU,
    //                 // excelOrder.orderedPrice = "",
    //                 // excelOrder.quantity = xlsx_dataa[rowIndex]?.Quantity,
    //                 // excelOrder.hsCode = xlsx_dataa[rowIndex]?.HSCODE,
    //                 // excelOrder.declaredValue = xlsx_dataa[rowIndex]?.DeclaredValue,
    //                 // excelOrder.backImagePlacement = xlsx_dataa[rowIndex]?.BackImagePlacement,
    //                 // excelOrder.backImageUrl = xlsx_dataa[rowIndex]?.BackImageURL,
    //                 // excelOrder.imagePlacement = xlsx_dataa[rowIndex]?.ImagePlacement,
    //                 // excelOrder.designUrl = xlsx_dataa[rowIndex]?.URLFileName,
    //             })

    //             //push each order key value data in bulk order array   
    //             bulkOrders.push(excelOrder)

    //         })
    //         //ends
    //         // findProductCodes?.data?.filter((data) => data?.productCode == itm?.Item)[0]?.price

    //         //check valid data in excel file or not
    //         //---------------------------------------------------------------------------------------------------------------
    //         let productCodes = bulkOrders?.map(({ Item }) => Item)
    //         //productCodes can be same in line items in excel so find unique than add check if it exist or not 
    //         let uniqueProductCodes = [...new Set(productCodes)]

    //         //shipMethods can be same in line items in excel so find unique than add check if it exist or not 
    //         let shipMethods = bulkOrders?.map(({ ShipMethod }) => ShipMethod)
    //         let uniqueShipMethods = [...new Set(shipMethods)]


    //         console.log(uniqueProductCodes, "uniqueProductCodes");
    //         console.log(uniqueShipMethods, "uniqueShipMethods");

    //         //find product Code exist or not 
    //         const findProductCodes = await getDataArray(ProductVarient, { productCode: { $in: uniqueProductCodes }, status: { $ne: 2 } })

    //         if (findProductCodes?.data?.length !== uniqueProductCodes?.length) {
    //             return helpers.showResponse(false, ResponseMessages?.product.invalid_product_code, {}, null, 400);
    //         }

    //         //find ship method exist or not 
    //         const findShipMethods = await getDataArray(ShipMethod, { shipMethod: { $in: uniqueShipMethods }, status: { $ne: 2 } })

    //         if (findShipMethods?.data?.length !== uniqueShipMethods?.length) {
    //             return helpers.showResponse(false, ResponseMessages?.product.invalid_ship_method, {}, null, 400);
    //         }
    //         //---------------------------------------------------------------------------------------------------------------
    //         //ends here
    //         const fixedPrefix = 'MWW1000';
    //         let countOrders = await getCount(Orders, {})
    //         const randomId = await helpers.generateOrderID(fixedPrefix, countOrders.data);


    //         //order Items payload
    //         let finalOrderItems = bulkOrders?.map((itm) => {
    //             let obj = {
    //                 // orderId: responseOrder?.data?._id,
    //                 productVarientId: findProductCodes?.data?.filter((data) => data?.productCode == itm?.Item)[0]?._id,
    //                 productCode: itm?.Item,
    //                 // upc: itm?.UPCSKU,
    //                 orderedPrice: findProductCodes?.data?.filter((data) => data?.productCode == itm?.Item)[0]?.price,
    //                 quantity: itm?.Quantity,
    //                 // hsCode: itm?.HSCODE,
    //                 // declaredValue: itm?.DeclaredValue,
    //                 // backImagePlacement: itm?.BackImagePlacement,
    //                 // backImageUrl: itm?.BackImageURL,
    //                 // imagePlacement: itm?.ImagePlacement,
    //                 // designUrl: itm?.URLFileName,
    //                 createdOn: helpers.getCurrentDate()
    //             }
    //             return obj
    //         })

    //         console.log(finalOrderItems, "finalOrderItems");

    //         let totalAmount = finalOrderItems.map((itm) => itm?.orderedPrice * itm?.quantity).reduce((acc, curr) => acc + curr).toFixed(2)
    //         console.log(totalAmount, "totalAmount");

    //         //Create Order With Order Paylaod
    //         //-------------------------------------------------------------
    //         let mainOrderPayload = {
    //             customerId: userId,
    //             shippingMethodId: findShipMethods?.data?.filter((itm) => itm?.shipMethod == bulkOrders[0]?.ShipMethod)[0]?._id,
    //             bulkImportRequestId: saveUploadedFile?.data?._id, //save bulk import id excel file
    //             displayId: randomId,
    //             source: 5,//5 used for excel upload
    //             amount: totalAmount, //total amount of orderItems
    //             isSubmitImmediately: SubmitImmediately,
    //             receipt: bulkOrders[0]?.Receipt ?? '',
    //             preship: bulkOrders[0]?.Preship ?? '',
    //             asin: bulkOrders[0]?.ASIN ?? null,
    //             ioss: bulkOrders[0]?.IOSS ?? null,
    //             shippingAccountNumber: bulkOrders[0]?.Ship3rdPartyAccount,
    //             shippingAddress: {
    //                 address1: bulkOrders[0]?.ShipAddr1 ?? null,
    //                 address2: bulkOrders[0]?.ShipAddr2 ?? null,
    //                 city: bulkOrders[0]?.ShipCity ?? null,
    //                 // companyEmail: "gkashyap9602@gmail.com",
    //                 // companyName: ShipName,
    //                 companyPhone: bulkOrders[0]?.ShipPhoneNumber ?? null,
    //                 contactName: bulkOrders[0]?.ShipName ?? null,
    //                 country: bulkOrders[0]?.ShipCountry ?? null,
    //                 stateName: bulkOrders[0]?.ShipState ?? null,
    //                 // taxId: "12345",
    //                 zipCode: bulkOrders[0]?.ShipZip ?? null
    //             },
    //             billingAddress: billingAddress, //fetch billing details from user profile
    //             orderDate: helpers.getCurrentDate()

    //         }

    //         let orderRef = new Order(mainOrderPayload)

    //         let responseOrder = await postData(orderRef)

    //         if (!responseOrder.status) {

    //             return helpers.showResponse(false, ResponseMessages.order.order_failed, null, null, 400);
    //         }
    //         //-------------------------------------------------------------
    //         //ends here
    //         // Adding the key to each object in the array
    //         finalOrderItems.forEach(item => {
    //             item['orderId'] = responseOrder?.data?._id;
    //         });


    //         let saveOrderItems = await insertMany(OrderItems, finalOrderItems)
    //         if (!saveOrderItems.status) {
    //             return helpers.showResponse(false, ResponseMessages.order.order_failed, null, null, 400);
    //         }


    //         console.log(bulkOrders, "bulkOrders");
    //         // console.log(result, "result");

    //         return helpers.showResponse(true, "bulk Import Success", {}, null, 200);
    //     } catch (error) {
    //         console.log(error, "error side");
    //         return helpers.showResponse(false, error?.message, null, null, 400);

    //     }

    // },
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

        console.log(status, "statuss");
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
                    // { "userData.firstName": { $regex: searchKey, $options: 'i' } }
                ]
            }

        }

        if (createdFrom && createdTill) {
            matchObj.orderDate = { $gte: createdFrom, $lte: createdTill }
        }

        console.log(matchObj, "matchObjjj");
        console.log(searchObj, "searchObj");

        let aggregate = [
            {
                $match: {
                    ...matchObj,
                    ...searchObj

                }
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
                $unwind: {
                    path: "$ShipMethodData",
                    preserveNullAndEmptyArrays: true
                }
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

                        //         // $or: [{ firstName: { $regex: searchKey, $options: 'i' } }]
                        //         firstName: { $regex: searchKey, $options: 'i'}
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
                $unwind: {
                    path: "$userData",
                    preserveNullAndEmptyArrays: true
                }
            },
            //regex on name
            // {
            //     $match: {
            //         $or: [{ "userData.firstName": { $regex: searchKey, $options: 'i' } }]
            //     }
            // },
            {
                $lookup: {
                    from: 'orderItems',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'orderItems',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'productLibraryVarient',
                                localField: 'productLibraryVarientId',
                                foreignField: '_id',
                                as: 'productLibraryVarientData',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: 'productLibrary',
                                            localField: 'productLibraryId',
                                            foreignField: '_id',
                                            as: 'productLibraryData',
                                            pipeline: [
                                                {
                                                    $project: {
                                                        _id: 1,
                                                        title: 1
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $unwind: {
                                            path: "$productLibraryData",
                                            preserveNullAndEmptyArrays: true
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: "$productLibraryVarientData",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        {
                            $project: {
                                // productLibraryId:1,
                                // productVarientId: 1,
                                productTitle: '$productLibraryVarientData.productLibraryData.title'
                            }

                        }
                    ]
                }

            },
            {
                $addFields: {
                    productNames: "$orderItems.productTitle",
                }
            },
            {
                $project: {
                    amount: {
                        $round: ["$amount", 2]
                    },
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

        //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
        let { totalCount, aggregation } = await helpers.getCountAndPagination(Order, aggregate, pageIndex, pageSize)
        console.log(totalCount, "totalCounttotalCount");

        const result = await Order.aggregate(aggregation);

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
                    status: 4
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
        // let receivedOrder = await Order.aggregate([
        //     {
        //         $match: {
        //             customerId: userId,
        //             status: 6
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             receivedOrder: { $sum: 1 }
        //         }
        //     }
        // ])
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
            // received: receivedOrder.length > 0 ? receivedOrder[0].receivedOrder : 0,
            shipped: shippedOrder.length > 0 ? shippedOrder[0].shippedOrder : 0,
            totalOrders: totalOrder.length > 0 ? totalOrder[0].totalOrder : 0,
        }
        // let total = await getCount(Order, matchObj)
        // let totalCount = total.data

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

        let aggregate = [
            {
                $match: {
                    ...matchObj,
                    ...searchObj

                }
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
                    amount: {
                        $round: ["$amount", 2]
                    },
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



        //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
        let { totalCount, aggregation } = await helpers.getCountAndPagination(Order, aggregate, pageIndex, pageSize)
        console.log(totalCount, "totalCounttotalCount");

        const result = await Order.aggregate(aggregation);

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
                $unwind: {
                    path: "$ShipMethodData",
                    preserveNullAndEmptyArrays: true
                },

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
                                email: 1,
                                phoneNumber: 1
                                // traceId:1,

                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$userData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'orderItems',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'orderItems',
                    pipeline: [
                        {
                            $lookup: {
                                from: "productVarient",
                                localField: "productCode",
                                foreignField: "productCode",
                                as: "productVarientData",
                                pipeline: [
                                    {
                                        $match: {
                                            status: { $ne: 2 }
                                        }
                                    }, //what if product soft deleted
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
                                                        productVariableOptionId: "$_id",
                                                        productVariableTypeId: "$variableTypeId",
                                                        optionValue: "$value",
                                                        // Add other fields you want to include in the result
                                                        typeName: '$variableTypeData.typeName' // Example of creating a new field
                                                    }

                                                }

                                            ]
                                        }
                                    },
                                    {
                                        $unwind: {
                                            path: "$variableOptionData"
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            // costPrice: "$price",
                                            // productCode: 1,
                                            variableOptionData: 1
                                            // varientOptions: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                productVarientOptions: "$productVarientData.variableOptionData",
                                productTitle:"dummy",
                                productImages:"dummyImage"
                            }
                        },
                        //
                        {
                            $project: {
                                productVarientData: 0,
                                // costPrice: "$price",
                                // productCode: 1,
                                // variableOptionData: 1
                                // varientOptions: 1,
                            }
                        }


                    ]//orderitem pipeline ends
                }

            },////hwhwhwhhwhw
            {
                $addFields: {
                    customerName: "$userData.firstName",
                    customerEmail: "$userData.email",
                    phoneNumber: "$userData.phoneNumber",
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
                                email: 1,
                                phoneNumber: 1
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
                    customerEmail: "$userData.email",
                    phoneNumber: "$userData.phoneNumber",
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

            console.log(response, "responsee");
            if (!response.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, {}, null, 200);
        }
        catch (err) {
            console.log(err, "error sideeee00000");
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