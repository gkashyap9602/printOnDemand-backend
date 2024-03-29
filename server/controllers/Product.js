var Product = require('../utils/Product');
const helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');

const adminController = {
    //admin 
    addProduct: async (req, res) => {
        let result = await Product.addProduct(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    //admin and user both
    getProductDetails: async (req, res) => {
        let result = await Product.getProductDetails(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    //admin and user both
    getAllProduct: async (req, res) => {
        let result = await Product.getAllProduct(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addProductVarient: async (req, res) => {
        if (req.files.length === 0) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await Product.addProductVarient(req.body, req.files);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateProduct: async (req, res) => {
        let result = await Product.updateProduct(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateProductVarient: async (req, res) => {
        let result = await Product.updateProductVarient(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteProduct: async (req, res) => {
        let result = await Product.deleteProduct(req.params);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteProductVarient: async (req, res) => {
        let result = await Product.deleteProductVarient(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteProductImage: async (req, res) => {
        let result = await Product.deleteProductImage(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    saveProductImage: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await Product.saveProductImage(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateVarientTemplate: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await Product.updateVarientTemplate(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteVarientTemplate: async (req, res) => {
        let result = await Product.deleteVarientTemplate(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    //admin 
    addVariableTypes: async (req, res) => {
        let result = await Product.addVariableTypes(req.body,);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addVariableOptions: async (req, res) => {
        let result = await Product.addVariableOptions(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteVariable: async (req, res) => {
        let result = await Product.deleteVariable(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateVariable: async (req, res) => {
        let result = await Product.updateVariable(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllVariableTypes: async (req, res) => {
        let result = await Product.getAllVariableTypes();
        return helpers.showOutput(res, result, result.statusCode);
    },
}

module.exports = {
    ...adminController
}