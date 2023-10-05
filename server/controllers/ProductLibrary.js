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
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await ProductLibrary.getLibraryImages(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...productLibraryController
}