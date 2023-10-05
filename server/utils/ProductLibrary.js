require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const LibraryImages = require('../models/LibraryImages')

const productLibrary = {

    saveLibraryImage: async (data, file) => {
        try {
            let { imageType} = data

            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }
            let obj = {
                fileName: '',
                imageUrl: s3Upload.data[0],
                imageType,
            }
            let libraryRef = new LibraryImages(obj)
            let result = await postData(libraryRef)
           
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.img_save_err, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.img_save_sucess, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    getLibraryImages: async () => {
        try {

            const result = await getDataArray(LibraryImages,{})

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
   

}

module.exports = {
    ...productLibrary
}