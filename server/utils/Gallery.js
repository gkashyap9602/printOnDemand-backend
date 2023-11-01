require('../db_functions');
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const Gallery = require('../models/Gallery')
const galleryUtil = {

    addToGallery: async (data, file) => {
        let { title, type } = data
        let name = type == 1 ? 'Images' : 'Videos'
        file.fieldname = `${file.fieldname}${name}`
        console.log(file, "filess");
        //upload image to aws s3 bucket
        const s3Upload = await helpers.uploadFileToS3([file])
        if (!s3Upload.status) {
            return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
        }
        console.log(s3Upload, "s3uploadd");
        let newObj = {
            title,
            type,
            url: s3Upload.data[0],
            createdOn: helpers.getCurrentDate()
        }

        let gallRef = new Gallery(newObj)
        let response = await postData(gallRef);
        if (response.status) {
            return helpers.showResponse(true, ResponseMessages.common.added_success, null, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages.common.save_failed, 'response', null, 400);
    },
    deleteFromGallery: async (data) => {
        try {
            const { title, gelleryId, type } = data

            const find = await getSingleData(Gallery, { status: { $ne: 2 }, _id: gelleryId, type })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
            }

            let obj = {
                title,
                status: 2,
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

            const result = await updateSingleData(Gallery, obj, { _id: gelleryId, status: { $ne: 2 }, type })

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    getGallery: async (data) => {
        const { type, pageIndex, pageSize } = data
        pageIndex = Number(pageIndex)
        pageSize = Number(pageSize)

        let totalCount = await getCount(Gallery, { type: Number(type) })
        const aggregationPipeline = [

            {
                $match: {
                    status: { $ne: 2 },
                    type: Number(type)
                },
            },
            {
                $skip: (pageIndex - 1) * pageSize // Skip records based on the page number
            },
            {
                $limit: pageSize // Limit the number of records per page
            },
        ];


        const result = await Gallery.aggregate(aggregationPipeline);
        console.log(result, "resulttt")

        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, {data:result,totalCount:totalCount?.data}, null, 200);
    },

}

module.exports = {
    ...galleryUtil
}