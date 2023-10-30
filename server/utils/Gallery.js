require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const Gallery = require('../models/Gallery')
const galleryUtil = {

    addToGallery: async (data, file) => {
        let { description, type } = data

        //upload image to aws s3 bucket
        const s3Upload = await helpers.uploadFileToS3([file])
        if (!s3Upload.status) {
            return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
        }

        let newObj = {
            description,
            type,
            url: s3Upload.data[0],
            createdOn: helpers.getCurrentDate()
        }

        let gallRef = new Gallery(newObj)
        let response = await postData(gallRef);
        if (response.status) {
            return helpers.showResponse(true, ResponseMessages.common.added_success, null, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages.common.save_failed, response, null, 200);
    },
    deleteGallery: async (data, file) => {
        try {

            const { description, gelleryId, type, status } = data

            const find = await getSingleData(Gallery, { status: { $ne: 2 }, _id: gelleryId, type })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
            }

            let obj = {
                status,
                description,
                updatedOn: helpers.getCurrentDate(),

            }
            // if (file) {
            //     //upload image to aws s3 bucket
            //     const s3Upload = await helpers.uploadFileToS3([file])
            //     if (!s3Upload.status) {
            //         return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            //     }
            //     obj.imageUrl = s3Upload.data[0]
            // }

            const result = await updateSingleData(Gallery, obj, { _id: id, status: { $ne: 2 }, type })

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

}

module.exports = {
    ...galleryUtil
}