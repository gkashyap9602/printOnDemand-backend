require('../db_functions');
let SubCategory = require('../models/subCategory')
let helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const Material = require('../models/Material')
const Product = require('../models/Product')
const VariableTypes = require('../models/VariableTypes')
const VariableOptions = require('../models/VariableOptions')
const ProductVarient = require('../models/ProductVarient')

const productUtils = {

    addProduct: async (data) => {
        try {
            let { careInstructions, longDescription, subCategoryIds, materialId, variableTypesIds,
                construction, features, productionDuration, shortDescription, title } = data

                const findProduct = await getSingleData(Product, { title: title })
                if (findProduct.status) {
                    return helpers.showResponse(false, ResponseMessages?.product.product_already_existed, {}, null, 403);
                }

                subCategoryIds = subCategoryIds.map((id) => mongoose.Types.ObjectId(id))
                variableTypesIds = variableTypesIds.map((id) => mongoose.Types.ObjectId(id))

            const findVariableTypes = await getDataArray(VariableTypes, { _id: { $in: variableTypesIds } })

            if (findVariableTypes?.data?.length !== variableTypesIds.length) {
                return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_type, {}, null, 403);
            }
            const findSubCategory = await getDataArray(SubCategory, { _id: { $in: subCategoryIds } })

            if (findSubCategory?.data?.length !== subCategoryIds.length) {
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
                variableTypesId: variableTypesIds,
                productionDuration,
                construction,
                shortDescription,
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
    updateProduct: async (data) => {
        try {
            let { careInstructions, longDescription, subCategoryIds,materialId,productId,
                construction, features, productionDuration, shortDescription, title } = data

                
                const findProduct = await getSingleData(Product, { _id: productId })
                if (!findProduct.status) {
                    return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 403);
                }
                subCategoryIds = subCategoryIds.map((id) => mongoose.Types.ObjectId(id))
              console.log(subCategoryIds,"subCategoryIds")
                   
            const findSubCategory = await getDataArray(SubCategory, { _id: { $in: subCategoryIds } })
              console.log(findSubCategory,"findSubCategory")
            if (findSubCategory?.data?.length !== subCategoryIds.length) {
                return helpers.showResponse(false, ResponseMessages?.category.invalid_subcategory_id, {}, null, 403);
            }
            const findMaterial = await getSingleData(Material, { _id: materialId })

            if (!findMaterial.status) {
                return helpers.showResponse(false, ResponseMessages?.material.invalid_material_id, {}, null, 403);
            }
            //in payload blank value not pass
            let obj = {
                careInstructions,
                longDescription,
                materialId,
                features,
                title,
                updatedOn: helpers.getCurrentDate(),
                subCategoryId: subCategoryIds,
                productionDuration,
                construction,
                shortDescription,
            }
            const result = await updateSingleData(Product,obj,{_id:productId})

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    
    getProductDetails: async (data) => {
        try {
            const { productId } = data
            const result = await Product.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(productId)
                    }
                },
                {
                    $lookup: {
                        from: "subCategory",
                        localField: "subCategoryId",
                        foreignField: "_id",
                        as: "productSubCategories",
                    }
                },
                {
                    $lookup: {
                        from: "category",
                        localField: "productSubCategories.categoryId",
                        foreignField: "_id",
                        as: "productCategories"
                    }
                },
                {
                    $lookup: {
                        from: "variableTypes",
                        localField: "variableTypesId",
                        foreignField: "_id",
                        as: "productVariableTypes"
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
                {
                    $lookup: {
                        from: "productVarient",
                        localField: "_id",
                        foreignField: "productId",
                        as: "productVarient",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "variableOptions",
                                    localField: "varientOptions.variableOptionId",
                                    foreignField: "_id",
                                    as: "varientOptions"
                                }
                            },
                            //  {
                            //     $project:{
                            //         _id:0,
                            //         varientOptions:0
                            //     }
                            //   }

                        ]
                    }
                },
                {
                    $project: {
                        subCategoryId: 0,
                        variableTypesId: 0
                    }
                }

            ]);
            // console.log(result, "resultt get product")

            if (result.length === 0) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess,result[0], null, 200);

        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
    getAllProduct: async (data) => {
        try {
            let { subCategoryId,pageSize=5,page=1,sort,filter } = data;  
            let id = new ObjectId(subCategoryId)
            pageSize = Number(pageSize)
            page = Number(page)

            let totalCount = await getCount(Product,{ subCategoryId: { $in: [id] }})
            // console.log(totalCount,"totalCount")
            const result = await Product.aggregate([
                {
                    $match: {
                        subCategoryId:{$in: [id]}
                    }
                },
                {
                    $lookup: {
                        from: "productVarient",
                        localField: "_id",
                        foreignField: "productId",
                        as: "ProductVarient",
                    }
                },
                {
                  $addFields:{
                    price:{$min:"$ProductVarient.price"},
                  }
                },
                // {
                //     $addFields:{
                //       priceStartsFrom: {
                //           $concat: ["$", { $toString: '$price'}]
                //       }
                //     }
                //   },
                // {
                //   $unwind:'$ProductVarient'
                // },
                {
                    $skip: (page - 1) * pageSize // Skip records based on the page number
                },
                {
                    $limit: pageSize // Limit the number of records per page
                },
                {
                    $project:{
                        _id:1,
                        careInstructions:1,
                        longDescription:1,
                        priceStartsFrom:1,
                        productImages:1,
                        productionDuration:1,
                        shortDescription:1,
                        sizeChart:1,
                        status:1,
                        title:1,
                        variantCount:1,
                        // ProductVarient:1,
                        priceStartsFrom:1

                    }
                }          

            ]);
            // console.log(result, "resultt get all products")
           
            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, {items:result,totalCount:totalCount.data}, null, 200);
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
    updateProductVarient: async (data) => {
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
                return helpers.showResponse(false, ResponseMessages?.variable.variable_type_already, {}, null, 403);
            }

            let obj = {
                typeName,
                createdOn: helpers.getCurrentDate(),

            }
            let productRef = new VariableTypes(obj)
            let result = await postData(productRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.variable_type_save_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.variable.variable_type_created, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    addVariableOptions: async (data) => {
        try {
            const { value, variableTypeId } = data

            const findVariableType = await getSingleData(VariableTypes, { _id: variableTypeId })
            if (!findVariableType.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_type, {}, null, 403);
            }
            const find = await getSingleData(VariableOptions, { value })
            if (find.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.variable_option_already, {}, null, 403);
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

            if (result.length === 0) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 403);
            }

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 403);

        }

    },
 
}

module.exports = {
    ...productUtils
}