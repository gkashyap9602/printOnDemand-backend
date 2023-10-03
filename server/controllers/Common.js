var Common = require('../utils/Common');
var helpers = require('../services/helper')

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

}

module.exports = {
    ...commonController
}