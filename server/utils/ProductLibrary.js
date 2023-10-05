require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const LibraryImages = require('../models/LibraryImages')

const productLibrary = {

    saveLibraryImage: async (data, file) => {
        try {
            let { displayOrder, imageType, productId } = data

            const findProduct = await getSingleData(Product, { _id: productId })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 403);
            }

            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }
            let result
            if (imageType == 1) {
                let obj = {
                    _id: mongoose.Types.ObjectId(),
                    fileName: '',
                    imageUrl: s3Upload.data[0],
                    imageType,
                    thumbnailPath: "",
                    displayOrder,
                }
                result = await Product.findByIdAndUpdate(productId, { $push: { productImages: obj } }, { new: true })

            }
            if (imageType == 3) {
                let obj = {
                    fileName: '',
                    imageUrl: s3Upload.data[0],
                    imageType,
                }
                result = await Product.findByIdAndUpdate(productId, { sizeChart: obj }, { new: true })

            }
            if (!result) {
                return helpers.showResponse(false, ResponseMessages?.product.product_image_save_err, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.product.product_image_saved, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    getLibraryImages: async (data, file) => {
        try {
            let { displayOrder, imageType, productId } = data

            const findProduct = await getSingleData(Product, { _id: productId })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 403);
            }

            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }
            let result
            if (imageType == 1) {
                let obj = {
                    _id: mongoose.Types.ObjectId(),
                    fileName: '',
                    imageUrl: s3Upload.data[0],
                    imageType,
                    thumbnailPath: "",
                    displayOrder,
                }
                result = await Product.findByIdAndUpdate(productId, { $push: { productImages: obj } }, { new: true })

            }
            if (imageType == 3) {
                let obj = {
                    fileName: '',
                    imageUrl: s3Upload.data[0],
                    imageType,
                }
                result = await Product.findByIdAndUpdate(productId, { sizeChart: obj }, { new: true })

            }
            if (!result) {
                return helpers.showResponse(false, ResponseMessages?.product.product_image_save_err, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.product.product_image_saved, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
   

}

module.exports = {
    ...productLibrary
}