const helpers = require('../services/helper/index')
const ProductQueue = require('../models/ProductQueue')
const StoreProduct = require('../models/StoreProducts')
const ProductLibrary = require('../models/ProductLibrary')
require('../db_functions/index')

const productQueue = helpers.generateQueue('productQueue')

//process product queue one by one 
productQueue.process(async (job, done) => {
    try {
        let { productData, endPointData, productLibraryId, userId, storeId } = job?.data //fetch data arguments from queue job 

        //endPointdata has store details 
        let addToStoreApi = await helpers.addProductToShopify(endPointData, productData)

        // console.log(addToStoreApi, "addToStoreApi");
        if (addToStoreApi.status) {

            let update = await ProductQueue.updateOne({ productLibraryId }, { $set: { status: 1, uploadDate: helpers.getCurrentDate() } })
            console.log(update, "update");

            //update product library product status add to store 1 means upload success
            await ProductLibrary.updateOne({ _id: productLibraryId }, { $set: { addToStore: 1, updatedOn: helpers.getCurrentDate() } })
            //save store Products when product uploaded to store 
            if (update.modifiedCount > 0) {
                //
                //create store product save payload 
                let obj = {
                    userId,
                    productLibraryId,
                    storeId,
                    storeProductId: addToStoreApi?.data?.product?.id, //store product id after upload
                    createdOn: helpers.getCurrentDate()

                }
                //save shopify product id in database 
                let storeProductRef = new StoreProduct(obj)
                let saveStoreProduct = await postData(storeProductRef)
                // console.log(saveStoreProduct, "storeProduct");
            }

            done()
        } else {
            // if product not added then update its status to failed
            await ProductQueue.updateOne({ productLibraryId }, { $set: { status: 3, uploadDate: helpers.getCurrentDate() } })
            done()
        }
    } catch (error) {
        console.log(error, "error Queueee");
    }
})