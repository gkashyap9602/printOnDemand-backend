const helpers = require('../services/helper/index')
const ResponseMessages = require('../constants/ResponseMessages');
const ProductQueue = require('../models/ProductQueue')
require('../db_functions/index')

// const productQueueProcess = async (job, done) => {
//     console.log(job, "jobbbb2222222222222");

//     try {
//         let { productData, endPointData, productLibraryId, userId } = job?.data


//         // console.log(productLibraryId, "productLibraryId");

//         let addToStoreApi = await helpers.addProductToShopify(endPointData, productData)

//         console.log(addToStoreApi, "addToStore222");
//         if (addToStoreApi.status) {

//             let updatePushStatus = await updateSingleData(ProductQueue, { pushStatus: 1 }, { userId, productLibraryId })


//             console.log(updatePushStatus, "Sucess updatePushStatus");

//             // return helpers.showResponse(true, addToStoreApi.message, addToStoreApi.data, null, 200)
//         }
//         return helpers.showResponse(false, addToStoreApi.data, addToStoreApi.message ? productData : ResponseMessages?.product.add_to_store_fail, null, 400);
//     } catch (error) {

//         let updatePushStatus = await updateSingleData(ProductQueue, { pushStatus: 3 }, { userId, productLibraryId })

//         console.log(error, "error Queueee");
//     }
//     done()

// }

// module.exports = productQueueProcess