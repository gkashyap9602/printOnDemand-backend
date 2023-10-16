require('../db_functions');
let helpers = require('../services/helper')
let Category = require('../models/Category')
let SubCategory = require('../models/subCategory')
const ResponseMessages = require("../constants/ResponseMessages")
const { default: mongoose } = require('mongoose');
const Product = require('../models/Product')

const categoryUtil = {
    //admin and user both
    getCategories: async (data) => {
        const { includeSubCategory = false, searchKey = '', parentCategoryId } = data
        const aggregationPipeline = [

            {
                $match: {
                    status: { $ne: 2 },
                },
            }
        ];

        if (includeSubCategory === 'true' || includeSubCategory === true) {

            if (parentCategoryId) {
                aggregationPipeline.push(
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(parentCategoryId),

                        },
                    },
                );
            }
            aggregationPipeline.push(
                // {
                //     $match: {
                //         'subCategories.status': { $ne: 2 },
                //     },
                // },
                {
                    $lookup: {
                        from: 'subCategory',
                        localField: '_id',
                        foreignField: 'categoryId',
                        as: 'subCategories',
                        pipeline: [{

                            $match: {
                                status: { $ne: 2 },
                            }

                        }]

                    },

                },
                {
                    $addFields: {
                        subCategories: {
                            $filter: {
                                input: '$subCategories',
                                as: 'subCategory',
                                cond: {
                                    $or: [
                                        { $regexMatch: { input: '$$subCategory.name', regex: searchKey, options: 'i' } },
                                        {}
                                    ],
                                },
                            },
                        },
                    },
                },
            )
            //ends if
        } else {
            aggregationPipeline.push(
                {
                    $match: {
                        name: { $regex: searchKey, $options: 'i' },
                    },
                },
            )
        }
        //ends if

        console.log(aggregationPipeline, "aggregationPipeline")

        const result = await Category.aggregate(aggregationPipeline);
        console.log(result, "resulttt")

        // if (result.length === 0) {
        //     return helpers.showResponse(false, ResponseMessages.common.data_not_found, null, null, 400);
        // }
        return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result, null, 200);
    },

    //admin 
    addCategories: async (data, file) => {
        try {
            const { name, description } = data

            const findCategory = await getSingleData(Category, { status: { $ne: 2 },name: name })
            if (findCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.category.category_already_existed, {}, null, 403);
            }
            //upload image to aws s3 bucket
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }

            let obj = {
                name,
                description,
                imageUrl: s3Upload?.data[0],
                createdOn: helpers.getCurrentDate(),

            }
            let categoryRef = new Category(obj)
            let result = await postData(categoryRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.category.category_save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.category.category_added, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    //admin 
    addSubCategories: async (data, file) => {
        try {
            const { name, description, categoryId } = data

            const findCategory = await getSingleData(Category, { _id: categoryId ,status: { $ne: 2 }})
            if (!findCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.category.category_not_exist, {}, null, 400);
            }
            const findSubCategory = await getSingleData(SubCategory, { status: { $ne: 2 },name: name })
            if (findSubCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.category.subcategory_already_existed, {}, null, 403);
            }
            //upload image to aws s3 bucket
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }

            let obj = {
                name,
                categoryId,
                description,
                imageUrl: s3Upload.data[0],
                createdOn: helpers.getCurrentDate(),

            }
            let subCategoryRef = new SubCategory(obj)
            let result = await postData(subCategoryRef)
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.subcategory_save_failed, result?.data, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.admin?.subcategory_added, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    updateCategory: async (data, file) => {
        try {
            const { name, description, id } = data

            const find = await getSingleData(Category, { status: { $ne: 2 },_id: id })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.category.category_not_exist, {}, null, 203);
            }

            let obj = {
                name,
                description,
                updatedOn: helpers.getCurrentDate(),

            }
            if (file) {
                //upload image to aws s3 bucket
                const s3Upload = await helpers.uploadFileToS3([file])
                if (!s3Upload.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
                }
                obj.imageUrl = s3Upload.data[0]
            }

            const result = await updateSingleData(Category, obj, { _id: id ,status: { $ne: 2 }})

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    updateSubcategory: async (data, file) => {
        try {
            const { name, description, id } = data

            const find = await getSingleData(SubCategory, { status: { $ne: 2 },_id: id })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.category.subcategory_not_exist, {}, null, 203);
            }

            let obj = {
                name,
                description,
                updatedOn: helpers.getCurrentDate(),

            }
            if (file) {
                //upload image to aws s3 bucket
                const s3Upload = await helpers.uploadFileToS3([file])
                if (!s3Upload.status) {
                    return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
                }
                obj.imageUrl = s3Upload.data[0]
            }

            const result = await updateSingleData(SubCategory, obj, { _id: id ,status: { $ne: 2 }})

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    deleteCategory: async (data) => {
        try {
            const { id } = data

            const find = await getSingleData(Category, { _id: id })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.category.category_not_exist, {}, null, 400);
            }

            const findSubCategory = await SubCategory.find({ status: { $ne: 2 }, categoryId: id })
            if (findSubCategory.length > 0) {
                return helpers.showResponse(false, ResponseMessages?.category.active_subcategory, {}, null, 400);
            }
            const result = await updateSingleData(Category, { status: 2 }, { _id: id })
            console.log(result, "resultt Category")


            if (result.status) {
                // await deleteData(SubCategory, { categoryId: id })

                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    deleteSubcategory: async (data, file) => {
        try {
            const { id } = data

            const find = await getSingleData(SubCategory, { _id: id })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.category.subcategory_not_exist, {}, null, 400);
            }

            const findProduct = await Product.find({ status: { $ne: 2 }, subCategoryId: { $in: [id] } })
            if (findProduct.length > 0) {
                return helpers.showResponse(false, ResponseMessages?.product.active_product, {}, null, 400);
            }

            // const result = await deleteById(SubCategory, id)
            const result = await updateSingleData(SubCategory, { status: 2 }, { _id: id })
            console.log(result, "resultt SubCategory")

            if (result.status) {
                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);

        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

}

module.exports = {
    ...categoryUtil
}