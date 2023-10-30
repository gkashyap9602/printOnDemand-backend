var Gallery = require('../utils/Gallery');
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');


const galleryController = {

    addToGallery: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        }
        let result = await Gallery.addToGallery(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...galleryController
}