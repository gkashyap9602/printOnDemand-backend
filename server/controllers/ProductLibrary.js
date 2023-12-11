var ProductLibrary = require('../utils/ProductLibrary');
const helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');

const productLibraryController = {
    //admin 
    saveLibraryImage: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await ProductLibrary.saveLibraryImage(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getLibraryImages: async (req, res) => {
        let result = await ProductLibrary.getLibraryImages();
        return helpers.showOutput(res, result, result.statusCode);
    },
    createProductLibrary: async (req, res) => {
        let userId = req.decoded._id;
        if (!userId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await ProductLibrary.createProductLibrary(req.body, userId);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateProductLibrary: async (req, res) => {
        let result = await ProductLibrary.updateProductLibrary(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateProductLibraryVarient: async (req, res) => {
        let result = await ProductLibrary.updateProductLibraryVarient(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteProductLibrary: async (req, res) => {
        let result = await ProductLibrary.deleteProductLibraryOrVarient(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getProductLibrary: async (req, res) => {
        let result = await ProductLibrary.getProductLibrary(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getProductLibraryDetails: async (req, res) => {
        let result = await ProductLibrary.getProductLibraryDetails(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...productLibraryController
}