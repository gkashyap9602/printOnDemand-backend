require('../db_functions');
let Administration = require('../models/Administration');
let Category = require('../models/Category')
let SubCategory = require('../models/subCategory')
// let ObjectId = require('mongodb').ObjectID;
let helpers = require('../services/helper');
let jwt = require('jsonwebtoken');
// let moment = require('moment');
let md5 = require('md5');
const ResponseMessages = require('../constants/ResponseMessages');
const consts = require('../constants/const');
const { default: mongoose } = require('mongoose');
const Material = require('../models/Material')
const Product = require('../models/Product')
const { randomUUID } = require('crypto')
const VariableTypes = require('../models/VariableTypes')
const VariableOptions = require('../models/VariableOptions')
const ProductVarient = require('../models/ProductVarient')
const ProductVarientOptions = require('../models/ProductVarientOptions')
const ProductVariableTypes = require('../models/ProductVariableTypes')
const ProductTemplate = require('../models/ProductTemplates')
const ProductCategory = require('../models/ProductCategory')


const adminUtils = {

    login: async (data) => {
        let { email, password } = data;
        let where = {
            email: email,
            password: md5(password),
            status: { $eq: 1 }
        }
        let result = await getSingleData(Administration, where, '');
        if (result.status) {
            let adminData = result?.data
            let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
            let access_token = jwt.sign({ user_type: "admin", type: "access", _id: adminData?._id }, API_SECRET, {
                expiresIn: consts.ACCESS_EXPIRY
            });
            // let refresh_token = jwt.sign({ user_type: "admin", type: "refresh" }, API_SECRET, {
            //     expiresIn: consts.REFRESH_EXPIRY
            // });
            delete adminData?._doc?.password
            adminData = { ...adminData?._doc, token: access_token }

            return helpers.showResponse(true, ResponseMessages?.admin?.login_success, adminData, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.admin?.invalid_login, null, null, 401);
    },
    addCategories: async (data, file) => {
        try {
            const { name, description } = data
            //upload image to aws s3 bucket
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 400);
            }
            console.log(s3Upload, "s3Upload")

            const findCategory = await getSingleData(Category, { name: name })
            if (findCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.category_already_existed, {}, null, 403);
            }

            let obj = {
                name,
                description,
                imageUrl: s3Upload?.data[0],
                createdOn: helpers.getCurrentDate(),
                guid: randomUUID(),

            }
            let categoryRef = new Category(obj)
            let result = await postData(categoryRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.category_save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.admin?.category_added, result?.data, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    addSubCategories: async (data, file) => {
        try {
            const { name, description, category_id } = data

            //upload image to aws s3 bucket
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 400);
            }
            console.log(s3Upload, "s3Upload")

            const findCategory = await getSingleData(Category, { _id: category_id })
            if (!findCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.category_not_exist, {}, null, 404);
            }
            const findSubCategory = await getSingleData(SubCategory, { name: name })
            if (findSubCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.subcategory_already_existed, {}, null, 403);
            }

            let obj = {
                name,
                category_id,
                description,
                imageUrl: s3Upload.data[0],
                createdOn: helpers.getCurrentDate(),
                guid: randomUUID(),

            }
            let subCategoryRef = new SubCategory(obj)
            let result = await postData(subCategoryRef)
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.subcategory_save_failed, result?.data, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.admin?.subcategory_added, result?.data, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    addMaterial: async (data) => {
        try {
            const { name } = data
            console.log(name, "nameee")
            const findMaterial = await getSingleData(Material, { name: name })
            if (findMaterial.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.already_existed, {}, null, 403);
            }

            let obj = {
                name,
                createdOn: helpers.getCurrentDate(),
                guid: randomUUID(),

            }
            let materialRef = new Material(obj)
            let result = await postData(materialRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.admin?.created_successfully, result?.data, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },

    addProduct: async (data) => {
        try {
            let { careInstructions, longDescription, categoryIds, materialId,
                construction, features, productionDuration, shortDescription, title } = data
            console.log(categoryIds, "categoryId")

            categoryIds = categoryIds.map((id) => mongoose.Types.ObjectId(id))

            console.log(categoryIds, "categoryIdsf")

            const findProduct = await getSingleData(Product, { title: title })
            if (findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.already_existed, {}, null, 403);
            }
            const findSubCategory = await getDataArray(SubCategory, { _id: { $in: categoryIds } })
            console.log(findSubCategory, "findSubcategory")
            console.log(categoryIds.length, "length")
            if (findSubCategory?.data.length !== categoryIds.length) {
                return helpers.showResponse(false, ResponseMessages?.admin?.invalid_subcategory, {}, null, 403);
            }
            // const findCategory = await getSingleData(Category, { _id: parentCategoryId, name: parentCategoryName })

            // if (!findCategory.status) {
            //     return helpers.showResponse(false, ResponseMessages?.admin?.invalid_category, {}, null, 403);
            // }
            const findMaterial = await getSingleData(Material, { _id: materialId })

            if (!findMaterial.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.invalid_Material_id, {}, null, 403);
            }

            let obj = {
                careInstructions,
                longDescription,
                // subCategory_id,?
                // imageUrl: s3Upload?.data[0],
                // priceStartsFrom,
                materialId,
                // materialName,
                features,
                // parentCategoryName,
                // parentCategoryId,
                productionDuration,
                shortDescription,
                // sizeChart,
                title,
                createdOn: helpers.getCurrentDate(),
                guid: randomUUID(),
            }

            const prodRef = new Product(obj)
            const saveProducts = await postData(prodRef)
            console.log(saveProducts, "saveProducts")

            if (!saveProducts.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.save_failed, result?.data, null, 400);

            }

            let prodCategory = categoryIds.map((categoryId) => {
                let item = {}
                item.subcategoryId = categoryId
                item.productId = saveProducts?.data._id
                return item
            })
            console.log(prodCategory, "prodCategory")

            const saveProdCategory = await insertMany(ProductCategory, prodCategory)

            console.log(saveProdCategory, "saveProdCategory")

            return helpers.showResponse(true, ResponseMessages?.admin?.created_successfully, saveProducts, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    getProductDetails: async (data) => {
        try {
            const { product_id } = data

            const result = await Product.aggregate([
                {
                    $match: { _id: product_id },
                },
                {
                    $lookup: {
                        from: 'variableOptions',
                        localField: '_id',
                        foreignField: 'variableTypeId',
                        as: 'variableOptions',
                    },
                },
            ])


            console.log(result, "result")

            if (result.length <= 0) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 403);
            }

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    addProductVarient: async (data) => {
        try {
            let { productCode, price, product_id, productVarientTemplates, varientOptions } = data

            const findProduct = await getSingleData(Product, { _id: product_id })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.not_exist, {}, null, 403);
            }

            let newObj = {
                productCode,
                price,
                product_id
            }
            const newProduct = new ProductVarient(newObj);
            const productVarient = await postData(newProduct)

            console.log(productVarient, "productVarient")
            if (productVarient.status) {
                productVarientTemplates = productVarientTemplates.map((value) => {
                    let item = { ...value?.productTemplate, ...value }
                    item.productVarientId = newProduct._id
                    return item
                })
                console.log(productVarientTemplates, "productVarientTemplates")

                const saveProductTemplate = await insertMany(ProductTemplate, productVarientTemplates)
                console.log(saveProductTemplate, "saveProductTemplatee")

                let variableTypesIds = varientOptions.map((id) => mongoose.Types.ObjectId(id.variableTypeId))
                const findVariableTypes = await VariableTypes.find({ _id: { $in: variableTypesIds } })

                console.log(findVariableTypes, "findVariableTypes")

                if (findVariableTypes.length !== variableTypesIds.length) {
                    return helpers.showResponse(false, ResponseMessages?.admin?.not_exist, {}, null, 403);

                }
                let pVariableType = varientOptions.map((value) => {
                    let item = { ...value }
                    item.productId = product_id
                    return item
                })
                console.log(pVariableType, "pVariableType")
                const saveProductVariableType = await insertMany(ProductVariableTypes, pVariableType)
                console.log(saveProductVariableType, "saveProductVariableType")

                let VariableOptionsData = varientOptions.map((value) => {
                    let item = { ...value }
                    item.value = value.variableOptionValue
                    return item
                })
                console.log(VariableOptionsData, "VariableOptionsData")

                const saveVariableOptions = await insertMany(VariableOptions, VariableOptionsData)
                console.log(saveVariableOptions, "saveVariableOptions")

                if (!saveVariableOptions.status) {
                    return helpers.showResponse(false, ResponseMessages?.admin?.save_failed, {}, null, 403);

                }
                let pVarientOptions = saveVariableOptions?.data.map((value) => {
                    let item = {}
                    item.variableOptionId = value._id
                    item.productVarientId = newProduct._id
                    return item
                })
                console.log(pVarientOptions, "pVarientOptions")

                const saveProductVarientOptions = await insertMany(ProductVarientOptions, pVarientOptions)
                console.log(saveProductVarientOptions, "saveProductVarientOptions")

                return helpers.showResponse(true, ResponseMessages?.admin?.created_successfully, productVarient, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.admin?.save_failed, {}, null, 403);

        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    saveProductImage: async (data, file) => {
        try {
            let { displayOrder, imageType, productGuid, image } = data
            image = JSON.parse(image)
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                // await FS.deleteFile(`${process.cwd()}/server/uploads/${imagePath}`);
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 400);
            }
            console.log(s3Upload, "s3Upload")
            const findProduct = await getSingleData(Product, { _id: productGuid })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.not_exist, {}, null, 403);
            }

            let obj = {
                fileName: image.fileName,
                imageUrl: s3Upload.data[0],
                imageType,
                thumbnailPath: "",
                display_order: displayOrder,
            }

            let result = await Product.findByIdAndUpdate(productGuid, { $push: { productImages: obj } }, { new: true })
            console.log(result, "resultt")
            if (!result) {
                return helpers.showResponse(false, ResponseMessages?.admin?.update_failed, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.admin?.update_successfully, result, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    addVariableTypes: async (data) => {
        try {
            const { typeName } = data

            const findProduct = await getSingleData(VariableTypes, { typeName })
            if (findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.already_existed, {}, null, 403);
            }

            let obj = {
                typeName,
                createdOn: helpers.getCurrentDate(),

            }
            let productRef = new VariableTypes(obj)
            let result = await postData(productRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.admin?.created_successfully, result?.data, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    addVariableOptions: async (data) => {
        try {
            const { value, variableTypeId } = data

            const findVariableType = await getSingleData(VariableTypes, { _id: variableTypeId })
            if (!findVariableType.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.not_exist, {}, null, 403);
            }
            const find = await getSingleData(VariableOptions, { value })
            if (find.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.already_existed, {}, null, 403);
            }

            let obj = {
                variableTypeId,
                value,
                createdOn: helpers.getCurrentDate(),

            }
            let productRef = new VariableOptions(obj)
            let result = await postData(productRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.admin?.save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.admin?.created_successfully, result?.data, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);
        }

    },
    getAllVariableTypes: async () => {
        try {
            const result = await VariableTypes.aggregate(
                [{
                    $lookup: {
                        from: 'variableOptions',
                        localField: '_id',
                        foreignField: 'variableTypeId',
                        as: 'variableOptions',
                    },
                },]
            )


            console.log(result, "result")

            if (result.length <= 0) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 403);
            }

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result, null, 200);
        }
        catch (err) {
            console.log(err, "errCatch")
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },

    // forgotPasswordMail: async (data) => {
    //     try {
    //         let { email } = data;
    //         let queryObject = { email: { $eq: email } }
    //         let result = await getSingleData(Administration, queryObject, '');
    //         if (result.status) {
    //             let otp = helpers.randomStr(4, "1234567890");
    //             let editObj = {
    //                 otp,
    //                 updated_on: moment().unix()
    //             }
    //             let response = await updateData(Administration, editObj, ObjectId(result.data._id))
    //             if (response.status) {
    //                 let to = email
    //                 let subject = `Reset Password Code`
    //                 let body = `
    //                     <div style="background-color: #f2f2f2; padding: 20px;">
    //                         <h2 style="color: #333333;">Forgot Password</h2>
    //                         <p style="color: #333333;">Hello Administrator,</p>
    //                         <p style="color: #333333;">We have received a request to reset your password. If you did not initiate this request, please ignore this email.</p>
    //                         <p style="color: #333333;">To reset your password, please use this OTP (One Time Password):</p>
    //                         <h3 style="color: #333333; text-align: center">${otp}</h3>
    //                         <p style="color: #333333;">Thank you,</p>
    //                         <p style="color: #333333;">Rico Support Team</p>
    //                     </div>
    //                 `
    //                 let emailResponse = await helpers.sendEmailService(to, subject, body)
    //                 if (emailResponse?.status) {
    //                     return helpers.showResponse(true, ResponseMessages?.admin?.forgot_password_email_sent, null, null, 200);
    //                 }
    //                 return helpers.showResponse(false, ResponseMessages?.admin?.forgot_password_email_error, null, null, 200);
    //             }
    //             return helpers.showResponse(false, ResponseMessages?.admin?.admin_account_error, null, null, 200);
    //         }
    //         return helpers.showResponse(false, ResponseMessages?.admin?.invalid_email, null, null, 200);
    //     } catch (err) {
    //         console.log("admin in catch", err)
    //         return helpers.showResponse(false, ResponseMessages?.admin?.forgot_password_email_error, null, null, 200);
    //     }
    // },
    // forgotChangePassword: async (data) => {
    //     let { otp, email, password } = data;
    //     let queryObject = { email, otp, status: { $ne: 2 } }
    //     let result = await getSingleData(Administration, queryObject, '');
    //     if (result.status) {
    //         let editObj = {
    //             otp: '',
    //             password: md5(password),
    //             updated_at: moment().unix()
    //         }
    //         let response = await updateData(Administration, editObj, ObjectId(result.data._id));
    //         if (response.status) {
    //             return helpers.showResponse(true, ResponseMessages?.admin?.admin_password_reset, null, null, 200);
    //         }
    //         return helpers.showResponse(false, ResponseMessages?.admin?.admin_password_reset_error, null, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.invalid_otp, null, null, 200);
    // },
    // getDetails: async (admin_id) => {
    //     let queryObject = { _id: ObjectId(admin_id), status: { $ne: 2 } }
    //     let result = await getSingleData(Administration, queryObject, '-password -access_token -refresh_token');
    //     if (result.status) {
    //         return helpers.showResponse(true, ResponseMessages?.admin?.admin_details, result.data, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.invalid_admin, null, null, 200);
    // },
    // changePasswordWithOld: async (data, admin_id) => {
    //     let { old_password, new_password } = data
    //     let queryObject = { _id: ObjectId(admin_id), password: md5(old_password), status: { $ne: 2 } }
    //     let result = await getSingleData(Administration, queryObject, '');
    //     if (!result.status) {
    //         return helpers.showResponse(false, ResponseMessages?.admin?.invalid_old_password, null, null, 200);
    //     }
    //     let editObj = {
    //         password: md5(new_password),
    //         updated_on: moment().unix()
    //     }
    //     let response = await updateData(Administration, editObj, ObjectId(admin_id));
    //     if (response.status) {
    //         return helpers.showResponse(true, ResponseMessages?.admin?.password_changed, null, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.password_change_error, null, 200);
    // },
    // update: async (data, admin_id) => {
    //     if ("email" in data && data.email != "") {
    //         let queryObject = { _id: { $ne: ObjectId(admin_id) }, email: data.email, status: { $ne: 2 } }
    //         let result = await getSingleData(Administration, queryObject, '');
    //         if (result.status) {
    //             return helpers.showResponse(false, ResponseMessages?.admin?.email_already, null, null, 200);
    //         }
    //     }
    //     data.updated_on = moment().unix();
    //     let response = await updateData(Administration, data, ObjectId(admin_id));
    //     if (response.status) {
    //         return helpers.showResponse(true, ResponseMessages?.admin?.admin_details_updated, null, null, 200);
    //     }
    //     return helpers.showResponse(false, ResponseMessages?.admin?.admin_details_update_error, null, null, 200);
    // },
    // getAdminData: async (data) => {
    //     try {
    //         let result = await CommonContent.findOne({})
    //         if (result) {
    //             return helpers.showResponse(true, ResponseMessages.common.data, result, null, 200);
    //         }
    //         return helpers.showResponse(true, ResponseMessages.report.not_found, null, null, 200);

    //     } catch (error) {
    //         return helpers.showResponse(false, error?.message, null, null, 200);
    //     }
    // },

}

module.exports = {
    ...adminUtils
}