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
// const ProductVarientOptions = require('../models/ProductVarientOptions')
// const ProductVariableTypes = require('../models/ProductVariableTypes')
// const ProductTemplate = require('../models/ProductTemplates')
// const ProductCategory = require('../models/ProductCategory')


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
        return helpers.showResponse(false, ResponseMessages?.admin?.invalid_login, null, null, 400);
    },
    addCategories: async (data, file) => {
        try {
            const { name, description } = data

            const findCategory = await getSingleData(Category, { name: name })
            if (findCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.category.category_already_existed, {}, null, 403);
            }
            //upload image to aws s3 bucket
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }
            console.log(s3Upload, "s3Upload")


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
    addSubCategories: async (data, file) => {
        try {
            const { name, description, categoryId } = data

            const findCategory = await getSingleData(Category, { _id: categoryId })
            if (!findCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.category.category_not_exist, {}, null, 400);
            }
            const findSubCategory = await getSingleData(SubCategory, { name: name })
            if (findSubCategory.status) {
                return helpers.showResponse(false, ResponseMessages?.category.subcategory_already_existed, {}, null, 403);
            }
            //upload image to aws s3 bucket
            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }
            console.log(s3Upload, "s3Upload")


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
    addMaterial: async (data) => {
        try {
            const { name } = data
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
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    addProduct: async (data) => {
        try {
            let { careInstructions, longDescription, subCategoryIds, materialId,
                construction, features, productionDuration, shortDescription, title } = data

            subCategoryIds = subCategoryIds.map((id) => mongoose.Types.ObjectId(id))

            const findProduct = await getSingleData(Product, { title: title })
            if (findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_already_existed, {}, null, 403);
            }
            const findSubCategory = await getDataArray(SubCategory, { _id: { $in: subCategoryIds } })

            if (findSubCategory?.data.length !== subCategoryIds.length) {
                return helpers.showResponse(false, ResponseMessages?.category.invalid_subcategory_id, {}, null, 403);
            }
            const findMaterial = await getSingleData(Material, { _id: materialId })

            if (!findMaterial.status) {
                return helpers.showResponse(false, ResponseMessages?.material.invalid_material_id, {}, null, 403);
            }
            let obj = {
                careInstructions,
                longDescription,
                materialId,
                features,
                title,
                createdOn: helpers.getCurrentDate(),
                subCategoryId: subCategoryIds,
                // imageUrl: s3Upload?.data[0],
                // priceStartsFrom,
                // materialName,
                // parentCategoryName,
                // parentCategoryId,
                // productionDuration,
                // shortDescription,
                // sizeChart,
            }
            const prodRef = new Product(obj)
            const saveProduct = await postData(prodRef)

            if (!saveProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_save_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.product.product_created, saveProduct?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    getProductDetails: async (data) => {
        try {
            const { productId } = data
                console.log(productId,"product id")
                const result = await Product.aggregate([
                    {
                      $match: {
                        _id: mongoose.Types.ObjectId(productId)
                      }
                    },
                    {
                      $lookup: {
                        from: "material",
                        localField: "materialId",
                        foreignField: "_id",
                        as: "material"
                      }
                    },
                
                    // {
                    //   $addFields: {
                    //     parentCategoryId: "$parentCategory.categoryId",
                    //     parentCategoryName: "$parentCategory.categoryName",
                    //     materialName: "$material.name"
                    //   }
                    // },
                    // {
                    //   $project: {
                    //     _id: 0,
                    //     guid: 1,
                    //     title: 1,
                    //     parentCategoryId: 1,
                    //     parentCategoryName: 1,
                    //     shortDescription: 1,
                    //     materialName: 1,
                    //     materialId: 1,
                    //     longDescription: 1,
                    //     careInstructions: 1,
                    //     status: 1,
                    //     productionDuration: 1,
                    //     process: 1,
                    //     construction: 1,
                    //     features: 1,
                    //     productImages: 1,
                    //     sizeChart: 1,
                    //     productVariableTypes: 1,
                    //     "productVarients.id": "$productVarients._id",
                    //     "productVarients.productId": "$productVarients.productId",
                    //     "productVarients.guid": "$productVarients.guid",
                    //     "productVarients.productCode": "$productVarients.productCode",
                    //     "productVarients.price": "$productVarients.price",
                    //     "productVarients.msrp": "$productVarients.msrp",
                    //     "productVarients.designPanels": "$productVarients.designPanels",
                    //     "productVarients.designerAvailable": "$productVarients.designerAvailable",
                    //     "productVarients.dpi": "$productVarients.dpi",
                    //     "productVarients.isDefaultTemplate": "$productVarients.isDefaultTemplate",
                    //     "productVarients.varientOptions": "$productVarients.varientOptions",
                    //     "productVarients.productVarientImages": "$productVarients.productVarientImages",
                    //     "productVarients.productVarientTemplates": "$productVarients.productVarientTemplates"
                    //   }
                    // }
                  ]);
                  
                  console.log(result);
                  
                  
                  console.log(result);
                  
          
              console.log(result,"resultt")

            if (result.length === 0) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    addProductVarient: async (data) => {
        try {
            let { productCode, price, productId, productVarientTemplates, varientOptions } = data

            const findProduct = await getSingleData(Product, { _id: productId })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 403);
            }

            const saveVariableOptions = await insertMany(VariableOptions, varientOptions)
            console.log(saveVariableOptions, "saveVariableOptions")

            if (!saveVariableOptions.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.variable_option_save_fail, {}, null, 400);
            }
            productVarientTemplates = productVarientTemplates.map((value) => {
                let item = { ...value }
                item._id = mongoose.Types.ObjectId()
                return item
            })
            let variableOptions = saveVariableOptions?.data.map((value) => {
                let item = { ...value }
                item.variableOptionId = value._id
                return item
            })
            let newObj = {
                productCode,
                price,
                productId,
                productVarientTemplates,
                varientOptions: variableOptions

            }
            const newProductVareint = new ProductVarient(newObj);
            const productVarient = await postData(newProductVareint)

            console.log(productVarient, "productVarient")

            if (productVarient.status) {
                return helpers.showResponse(true, ResponseMessages?.admin?.created_successfully, productVarient, null, 200);
            }
            //ends
            return helpers.showResponse(false, ResponseMessages?.product.product_varient_save_fail, {}, null, 403);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }

    },
    saveProductImage: async (data, file) => {
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