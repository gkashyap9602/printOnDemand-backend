var Category = require('../utils/Category');
var helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")

const categoryController = {

    getCategories: async (req, res) => {
        let result = await Category.getCategories(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addCategories: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await Category.addCategories(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addSubCategories: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await Category.addSubCategories(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateCategory: async (req, res) => {
        let result = await Category.updateCategory(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateSubcategory: async (req, res) => {
        let result = await Category.updateSubcategory(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteCategory: async (req, res) => {
        let result = await Category.deleteCategory(req.params);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteSubcategory: async (req, res) => {
        let result = await Category.deleteSubcategory(req.params);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...categoryController
}