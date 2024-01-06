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
const { getFileType } = require('../services/helper/index')

const productUtils = {

    addProduct: async (data) => {
        try {
            let { careInstructions, longDescription, subCategoryIds, materialIds, variableTypesIds,
                construction, features, productionDuration, shortDescription, title, process } = data


            subCategoryIds = subCategoryIds.map((id) => mongoose.Types.ObjectId(id))
            const findProduct = await getSingleData(Product, { title: title, status: { $ne: 2 }, subCategoryId: { $in: subCategoryIds } })
            if (findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_already_existed, {}, null, 400);
            }

            variableTypesIds = variableTypesIds.map((id) => mongoose.Types.ObjectId(id))
            materialIds = materialIds.map((id) => mongoose.Types.ObjectId(id))

            const findVariableTypes = await getDataArray(VariableTypes, { _id: { $in: variableTypesIds }, status: { $ne: 2 } })

            if (findVariableTypes?.data?.length !== variableTypesIds?.length) {
                return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_type, {}, null, 400);
            }
            const findSubCategory = await getDataArray(SubCategory, { _id: { $in: subCategoryIds }, status: { $ne: 2 } })

            if (findSubCategory?.data?.length !== subCategoryIds?.length) {
                return helpers.showResponse(false, ResponseMessages?.category.invalid_subcategory_id, {}, null, 400);
            }

            const findMaterials = await getDataArray(Material, { _id: { $in: materialIds } })
            if (findMaterials?.data?.length !== materialIds?.length) {
                return helpers.showResponse(false, ResponseMessages?.material.invalid_material_id, {}, null, 400);
            }
       
            let obj = {
                careInstructions,
                longDescription,
                features,
                title,
                createdOn: helpers.getCurrentDate(),
                subCategoryId: subCategoryIds,
                variableTypesId: variableTypesIds,
                materialId: materialIds,
                productionDuration,
                construction,
                shortDescription,
                process
            }
            const prodRef = new Product(obj)
            const result = await postData(prodRef)

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_save_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.product.product_created, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    updateProduct: async (data) => {
        try {
            let { careInstructions, longDescription, subCategoryIds, materialIds, productId,
                construction, features, productionDuration, shortDescription, title, process } = data


            const findProduct = await getSingleData(Product, { _id: productId, status: { $ne: 2 } })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
            }

            const findTitle = await getSingleData(Product, { title, _id: { $ne: productId }, status: { $ne: 2 } })
            if (findTitle.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_title_already, {}, null, 400);
            }
            subCategoryIds = subCategoryIds.map((id) => mongoose.Types.ObjectId(id))
            materialIds = materialIds.map((id) => mongoose.Types.ObjectId(id))

            const findSubCategory = await getDataArray(SubCategory, { _id: { $in: subCategoryIds }, status: { $ne: 2 } })
            if (findSubCategory?.data?.length !== subCategoryIds.length) {
                return helpers.showResponse(false, ResponseMessages?.category.invalid_subcategory_id, {}, null, 400);
            }

            const findMaterials = await getDataArray(Material, { _id: { $in: materialIds }, status: { $ne: 2 } })
            if (findMaterials?.data?.length !== materialIds.length) {
                return helpers.showResponse(false, ResponseMessages?.material.invalid_material_id, {}, null, 400);
            }
            //in payload blank value not pass
            let obj = {
                careInstructions,
                longDescription,
                features,
                title,
                process,
                updatedOn: helpers.getCurrentDate(),
                subCategoryId: subCategoryIds,
                materialId: materialIds,
                productionDuration,
                construction,
                shortDescription,
            }
            const result = await updateSingleData(Product, obj, { _id: productId, title: findProduct?.data?.title })
            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }
    },
    addProductVarient: async (data, files) => {
        try {
            let { productCode, price, productId, varientOptions } = data

            if (typeof varientOptions == 'string') {
                varientOptions = JSON.parse(varientOptions)
            }
            const findProduct = await getSingleData(Product, { _id: productId, status: { $ne: 2 } })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
            }

            const findProductCode = await getSingleData(ProductVarient, { productCode, productId, status: { $ne: 2 } })
            if (findProductCode.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_code_already, {}, null, 400);
            }

            const saveVariableOptions = await insertMany(VariableOptions, varientOptions)
            if (!saveVariableOptions.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.variable_option_save_fail, {}, null, 400);
            }
            let s3Upload = await helpers.uploadFileToS3(files)
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, {}, null, 203);
            }
            let productVarientTemplates = files.map((file) => {
                let fileExtension = file.originalname.split('.').pop().toLowerCase()
                let item = {}
                s3Upload?.data?.map((url) => {
                    let s3fileExtension = url.split('.').pop().toLowerCase()

                    if (fileExtension == s3fileExtension) {
                        item._id = mongoose.Types.ObjectId()
                        item.fileName = file.originalname
                        item.filePath = url,
                            item.templateType = getFileType[fileExtension]
                    }
                })
                return item
            })

            let variableOptions = saveVariableOptions?.data.map((value) => {
                let item = { ...value }
                item.variableOptionId = value._id
                return item
            })
            let newObj = {
                productCode,
                price: price,
                productId,
                productVarientTemplates,
                varientOptions: variableOptions

            }
            const newProductVareint = new ProductVarient(newObj);
            const result = await postData(newProductVareint)

            if (result.status) {

                await Product.updateOne({ _id: productId }, { $inc: { variantCount: 1 } })

                return helpers.showResponse(true, ResponseMessages?.product?.product_varient_save, result?.data, null, 200);
            }
            //ends
            return helpers.showResponse(false, ResponseMessages?.product?.product_varient_save_fail, {}, null, 400);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }

    },
    updateProductVarient: async (data) => {
        try {
            let { productCode, price, productVarientId } = data

            const find = await getSingleData(ProductVarient, { _id: productVarientId })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_varient_not_exist, {}, null, 400);
            }

            const findCode = await getSingleData(ProductVarient, { productCode: productCode, _id: { $ne: mongoose.Types.ObjectId(productVarientId) } })
            if (findCode.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_code_already, {}, null, 400);
            }

            let newObj = {
                productCode,
                price: price,
            }

            const result = await updateSingleData(ProductVarient, newObj, { _id: productVarientId, productCode: find?.data?.productCode })
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
                        _id: mongoose.Types.ObjectId(productId),
                        status: { $ne: 2 },
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
                                $match: {
                                    status: { $ne: 2 }
                                }
                            },
                            {
                                $lookup: {
                                    from: "variableOptions",
                                    localField: "varientOptions.variableOptionId",
                                    foreignField: "_id",
                                    as: "varientOptions",
                                    pipeline: [{
                                        $lookup: {
                                            from: "variableTypes",
                                            localField: "variableTypeId",
                                            foreignField: "_id",
                                            as: "variableTypeDetails",
                                        },

                                    },
                                    {
                                        $unwind: '$variableTypeDetails'
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            variableTypeId: 1,
                                            value: 1,
                                            variableTypeName: '$variableTypeDetails.typeName'
                                        }
                                    }

                                    ]
                                }
                            },

                        ]
                    }
                },
                {
                    $project: {
                        subCategoryId: 0,
                        variableTypesId: 0,
                        materialId: 0
                    }
                }

            ]);

            if (result.length === 0) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result[0], null, 200);

        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    getAllProduct: async (data) => {
        try {
            let { subCategoryId, pageSize = 10, page = 1, sortDirection = "asc", sortColumn = "title", materialFilter, searchKey = '' } = data;
            let id = new ObjectId(subCategoryId)
            pageSize = Number(pageSize)
            page = Number(page)

            let searchTerms
            let titleSearch
            let valueSearch

            if (searchKey) {
                searchKey = searchKey.trim()
                searchTerms = searchKey.split(' ');
                titleSearch = searchTerms[0];
                valueSearch = searchTerms.slice(1).join(' ');

            }

            console.log(titleSearch, "titleSearch ");
            console.log(valueSearch, "valueSearch");
            let matchObj = {
                subCategoryId: { $in: [id] },
                status: { $ne: 2 },

            }
            if (titleSearch) {
                matchObj.title = { $regex: searchKey, $options: 'i' }
            }

            if (materialFilter && materialFilter !== 'null') {
                materialFilter = JSON.parse(materialFilter)
                materialFilter = materialFilter.map((id) => new ObjectId(id))
                matchObj.materialId = { $in: materialFilter }

            }

            let aggregate = [
                {
                    $match: {
                        ...matchObj,
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
                    $lookup: {
                        from: "variableOptions",
                        localField: "ProductVarient.varientOptions.variableOptionId",
                        foreignField: "_id",
                        as: "Variable",

                    }
                },
                // {
                //     $match: {
                //         "Variable.value": { $regex: valueSearch, $options: 'i' },
                //     }
                // },
                {
                    $lookup: {
                        from: "variableTypes",
                        localField: "Variable.variableTypeId",
                        foreignField: "_id",
                        as: "VariableTypes",
                    }
                },

                {
                    $addFields: {
                        priceStartsFrom: { $min: "$ProductVarient.price" },

                    }
                },
                // {
                //     $unwind: "$Variable" // Unwind the "Variable" array
                // },
                {
                    $sort: {
                        [sortColumn]: sortDirection === "asc" ? 1 : -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        careInstructions: 1,
                        longDescription: 1,
                        productImages: 1,
                        productionDuration: 1,
                        shortDescription: 1,
                        sizeChart: 1,
                        isCustomizable: 1,
                        isPersonalizable: 1,
                        status: 1,
                        title: 1,
                        variantCount: 1,
                        priceStartsFrom: 1,
                        Variable: 1,
                        VariableTypes: 1,


                    }
                }
            ]


            // if (valueSearch) {
            //     console.log("under value search");

            //     let match = {
            //         $match: {
            //             "Variable.value": { $regex: valueSearch, $options: 'i' },
            //         }
            //     }
            //     aggregate.push(match)

            // }

            // add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
            let { totalCount, aggregation } = await helpers.getCountAndPagination(Product, aggregate, page, pageSize)

            const result = await Product.aggregate(aggregation);

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, { items: result, totalCount }, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    saveProductImage: async (data, file) => {
        try {
            let { displayOrder, imageType, productId } = data

            const findProduct = await getSingleData(Product, { _id: productId, status: { $ne: 2 } })
            if (!findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
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

    deleteProductImage: async (data) => {
        try {
            const { imageId, productId, imageType } = data

            const find = await getSingleData(Product, { _id: productId })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
            }

            let result
            //type 1 for productImages
            if (imageType == 1) {
                result = await removeItemFromArray(Product, { _id: productId }, 'productImages', imageId)
            }
            //type 3 for sizeChart
            if (imageType == 3) {
                let obj = {
                    fileName: "",
                    imageType: 3,
                    imageUrl: null

                }
                result = await updateSingleData(Product, { sizeChart: obj }, { _id: productId })
            }
            if (result.status) {
                //varient Options are not deleted from collection?
                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

    updateVarientTemplate: async (data, file) => {
        try {
            let { templateId, templateType, productVarientId } = data

            const findProductVarient = await getSingleData(ProductVarient, { _id: productVarientId })
            if (!findProductVarient.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_varient_not_exist, {}, null, 400);
            }

            const findVarientTemplate = await getSingleData(ProductVarient, { _id: productVarientId, productVarientTemplates: { $elemMatch: { templateType } } })

            if (findVarientTemplate.status) {
                return helpers.showResponse(false, ResponseMessages?.product.varient_template_already, {}, null, 400);
            }

            const s3Upload = await helpers.uploadFileToS3([file])
            if (!s3Upload.status) {
                return helpers.showResponse(false, ResponseMessages?.common.file_upload_error, result?.data, null, 203);
            }
            let obj = {
                _id: mongoose.Types.ObjectId(),
                fileName: file.originalname,
                filePath: s3Upload.data[0],
                templateType,
            }
            let result = await ProductVarient.findByIdAndUpdate(productVarientId, { $push: { productVarientTemplates: obj } }, { new: true })


            if (!result) {
                return helpers.showResponse(false, ResponseMessages?.product.varient_template_update_err, {}, null, 400);
            }
            return helpers.showResponse(true, ResponseMessages?.product.varient_template_update, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    deleteVarientTemplate: async (data) => {
        try {
            const { templateId, productVarientId, templateType } = data

            const find = await getSingleData(ProductVarient, { _id: productVarientId })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_varient_not_exist, {}, null, 400);
            }

            let result = await removeItemFromArray(ProductVarient, { _id: productVarientId }, 'productVarientTemplates', templateId)
            if (result.status) {
                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
            }
            return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    deleteProduct: async (data) => {
        try {
            const { productId } = data

            const find = await getSingleData(Product, { _id: productId })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_not_exist, {}, null, 400);
            }

            const result = await updateSingleData(Product, { status: 2 }, { _id: productId })

            if (result.status) {
                //varient Options are not deleted from collection?
                // await deleteData(ProductVarient, { productId: productId })
                await updateByQuery(ProductVarient, { status: 2 }, { productId: productId })
                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    deleteProductVarient: async (data) => {
        try {
            const { productId, productVarientId } = data

            const find = await getSingleData(ProductVarient, { _id: productVarientId, productId })
            if (!find.status) {
                return helpers.showResponse(false, ResponseMessages?.product.product_varient_not_exist, {}, null, 400);
            }
            const result = await updateSingleData(ProductVarient, { status: 2 }, { _id: productVarientId, productId })
            if (result.status) {
                //varient Options are not deleted from collection?
                await Product.updateOne({ _id: productId }, { $inc: { variantCount: -1 } })

                return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, {}, null, 200);
            }

            return helpers.showResponse(false, ResponseMessages?.common.delete_failed, {}, null, 400);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },
    addVariableTypes: async (data) => {
        try {
            const { typeName } = data

            const findProduct = await getSingleData(VariableTypes, { typeName, status: { $ne: 2 } })
            if (findProduct.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.variable_type_already, {}, null, 400);
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

            const findVariableType = await getSingleData(VariableTypes, { _id: variableTypeId, status: { $ne: 2 } })
            if (!findVariableType.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_type, {}, null, 400);
            }
            const find = await getSingleData(VariableOptions, { value, status: { $ne: 2 } })
            if (find.status) {
                return helpers.showResponse(false, ResponseMessages?.variable.variable_option_already, {}, null, 400);
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
            return helpers.showResponse(false, err?.message, null, null, 400);
        }

    },
    deleteVariable: async (data) => {
        try {
            const { variableTypeId, variableOptionId } = data

            let result

            if (variableTypeId) {

                const findVariableType = await getSingleData(VariableTypes, { _id: variableTypeId, status: { $ne: 2 } })
                if (!findVariableType.status) {
                    return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_type, {}, null, 400);
                }
                const findVariableOptions = await VariableOptions.find({ status: { $ne: 2 }, variableTypeId: variableTypeId })
                if (findVariableOptions.length > 0) {
                    return helpers.showResponse(false, ResponseMessages?.variable.active_options, {}, null, 400);
                }
                result = await updateSingleData(VariableTypes, { status: 2 }, { _id: variableTypeId })
            }
            if (variableOptionId) {

                const findVariableOption = await getSingleData(VariableOptions, { _id: variableOptionId, status: { $ne: 2 } })
                if (!findVariableOption.status) {
                    return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_option, {}, null, 400);
                }

                result = await updateSingleData(VariableOptions, { status: 2 }, { _id: variableOptionId })
            }

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.delete_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.delete_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }

    },
    updateVariable: async (data) => {
        try {
            const { variableTypeId, typeName, value, variableOptionId } = data

            let result

            if (variableTypeId && typeName) {

                const findVariableType = await getSingleData(VariableTypes, { _id: variableTypeId, status: { $ne: 2 } })
                if (!findVariableType.status) {
                    return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_type, {}, null, 400);
                }
                result = await updateSingleData(VariableTypes, { typeName }, { _id: variableTypeId })
            }
            if (variableOptionId && value) {

                const findVariableOption = await getSingleData(VariableOptions, { _id: variableOptionId, status: { $ne: 2 } })
                if (!findVariableOption.status) {
                    return helpers.showResponse(false, ResponseMessages?.variable.invalid_variable_option, {}, null, 400);
                }
                result = await updateSingleData(VariableOptions, { value }, { _id: variableOptionId })

            }

            if (!result.status) {
                return helpers.showResponse(false, ResponseMessages?.common.update_failed, result?.data, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.update_sucess, result?.data, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);
        }

    },
    getAllVariableTypes: async () => {
        try {
            const result = await VariableTypes.aggregate(
                [
                    {
                        $match: {
                            status: { $ne: 2 },
                        }
                    },
                    {
                        $lookup: {
                            from: 'variableOptions',
                            localField: '_id',
                            foreignField: 'variableTypeId',
                            as: 'variableOptions',
                        },
                    },]
            )

            if (result.length === 0) {
                return helpers.showResponse(false, ResponseMessages?.common.data_not_found, {}, null, 400);
            }

            return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result, null, 200);
        }
        catch (err) {
            return helpers.showResponse(false, err?.message, null, null, 400);

        }

    },

}

module.exports = {
    ...productUtils
}