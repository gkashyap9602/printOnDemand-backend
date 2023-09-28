var Common = require('../utils/Common');
var helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")
// const videoMulterRef = helpers.addToMulter.array('rico_video')
// const fileMulterRef = helpers.addToMulter.array('rico_file')

const commonController = {

    storeParameterToAWS: async (req, res) => {
        let requiredFields = ['name', 'value'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Common.storeParameterToAWS(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    fetchParameterFromAWS: async (req, res) => {
        let requiredFields = ['name'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Common.fetchParameterFromAWS(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getCategories: async (req, res) => {
        let result = await Common.getCategories(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllCountries: async (req, res) => {
        let result = await Common.getAllCountries();
        return helpers.showOutput(res, result, result.statusCode);
    },
    getMaterials: async (req, res) => {
        let result = await Common.getMaterials(req?.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllStates: async (req, res) => {
        let result = await Common.getAllStates(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    // uploadVideoToS3: async (req, res) => {
    //     videoMulterRef(req, res, async (err) => {
    //         if (err || !req.files) {
    //             return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.common?.no_video_file), 203);
    //         }
    //         let result = await helpers.uploadVideoToS3(req.files)
    //         return helpers.showOutput(res, result, result.statuscode);
    //     })
    // },
    
    // uploadFileToS3: async (req, res) => {
    //     fileMulterRef(req, res, async (err) => {
    //         if (err || !req.files) {
    //             return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.common?.no_file), 203);
    //         }
    //         let result = await helpers.uploadFileToS3(req.files)
    //         return helpers.showOutput(res, result, result.statuscode);
    //     })
    // },
}

module.exports = {
    ...commonController
}