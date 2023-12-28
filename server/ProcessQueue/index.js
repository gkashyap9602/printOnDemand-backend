const helpers = require('../services/helper/index')
const path = require('path')
const ResponseMessages = require('../constants/ResponseMessages');
const ProductQueue = require('../models/ProductQueue')

// productQueue.process(path.join(__dirname, 'productQueueProcess.js'))

const productQueue = helpers.generateQueue('productQueue')


//process product queue one by one 
productQueue.process(async (job, done) => {
    console.log(job, "queue job000000");
    try {
        let { productData, endPointData, productLibraryId, userId } = job?.data

        let addToStoreApi = await helpers.addProductToShopify(endPointData, productData)
        // console.log(addToStoreApi, "addToStore222");
        if (addToStoreApi.status) {

            let update = await ProductQueue.updateOne({ productLibraryId }, { $set: { pushStatus: 1 } })
            console.log(update, "update");

            // let updatePushStatus = await updateSingleData(ProductQueue, { pushStatus: 1 }, {productLibraryId})
            // console.log(updatePushStatus, " updatePushStatus");
            // return helpers.showResponse(true, addToStoreApi.message, addToStoreApi.data, null, 200)

            done()
        } else {
            let update = await ProductQueue.updateOne({ productLibraryId }, { $set: { pushStatus: 3 } })
            done()
        }
        // return helpers.showResponse(false, addToStoreApi.data, addToStoreApi.message ? productData : ResponseMessages?.product.add_to_store_fail, null, 400);
    } catch (error) {
        console.log(error, "error Queueee");
    }
})

// productQueue.on('completed', (job) => {
//     console.log(`Completed ${job.id}`);
// })
