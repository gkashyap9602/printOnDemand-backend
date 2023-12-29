const helpers = require('../services/helper/index')
const path = require('path')
const ResponseMessages = require('../constants/ResponseMessages');
const ProductQueue = require('../models/ProductQueue')
const StoreProduct = require('../models/StoreProducts')
const ProductLibrary = require('../models/ProductLibrary')
require('../db_functions/index')
// productQueue.process(path.join(__dirname, 'productQueueProcess.js'))

const productQueue = helpers.generateQueue('productQueue')


//process product queue one by one 
productQueue.process(async (job, done) => {
    console.log(job, "queue job000000");
    try {
        let { productData, endPointData, productLibraryId, userId } = job?.data

        //endPointdata has store details 
        let addToStoreApi = await helpers.addProductToShopify(endPointData, productData)
        console.log(addToStoreApi, "addToStore222444");
        if (addToStoreApi.status) {

            let update = await ProductQueue.updateOne({ productLibraryId }, { $set: { status: 1, uploadDate: helpers.getCurrentDate() } })
            console.log(update, "update");

            //update product library product status add to store 1 means upload success
            let updateAddToStore = await ProductLibrary.updateOne({ _id: productLibraryId }, { $set: { addToStore: 1, updatedOn: helpers.getCurrentDate() } })
            //save store Products when product uploaded to store 
            if (update.modifiedCount > 0) {

                //create store product save payload 
                let obj = {
                    userId,
                    productLibraryId,
                    storeId: endPointData?._id,
                    storeDetails: {
                        storeName: endPointData?.storeName,
                        shop: endPointData?.shop,
                        storeType: Number(endPointData?.storeType)
                    },
                    storeProductId: addToStoreApi?.data?.product?.id, //store product id after upload
                    createdOn: helpers.getCurrentDate()

                }
                let storeProductRef = new StoreProduct(obj)
                let saveStoreProduct = await postData(storeProductRef)
                console.log(saveStoreProduct, "storeProduct");
            }

            // let updatePushStatus = await updateSingleData(ProductQueue, { pushStatus: 1 }, {productLibraryId})
            // console.log(updatePushStatus, " updatePushStatus");
            // return helpers.showResponse(true, addToStoreApi.message, addToStoreApi.data, null, 200)

            done()
        } else {
            let update = await ProductQueue.updateOne({ productLibraryId }, { $set: { status: 3, uploadDate: helpers.getCurrentDate() } })
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
