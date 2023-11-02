var Gallery = require('../utils/Gallery');
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');


const galleryController = {

    addToGallery: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        console.log(req.session,"req sessin get galle side ");

        let result = await Gallery.addToGallery(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteFromGallery: async (req, res) => {
        let result = await Gallery.deleteFromGallery(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getGallery: async (req, res) => {
        let result = await Gallery.getGallery(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...galleryController
}