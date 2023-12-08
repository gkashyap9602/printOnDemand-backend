var Common = require('../utils/Common');
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');

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
    getAllShippingMethods: async (req, res) => {
        let result = await Common.getAllShippingMethods(req?.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllStates: async (req, res) => {
        let result = await Common.getAllStates(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getWaitingListStatus: async (req, res) => {
        let result = await Common.getWaitingListStatus(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },

    getFaqCategories: async (req, res) => {
        let result = await Common.getFaqCategories(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getCategoriesArticle: async (req, res) => {
        let result = await Common.getCategoriesArticle(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getSingleCategoryArticle: async (req, res) => {
        let result = await Common.getSingleCategoryArticle(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getSearchArticle: async (req, res) => {
        let result = await Common.getSearchArticle(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    raiseTicket: async (req, res) => {
        let userId = req.decoded.user_id;
        if (!userId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Common.raiseTicket(req.body,userId);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getCommonContent: async (req, res) => {
        let result = await Common.getCommonContent();
        return helpers.showOutput(res, result, result.statusCode);
    },
    // addNewQuestion: async (req, res) => {
    //     let result = await Common.addNewQuestion(req.body);
    //     return helpers.showOutput(res, result, result.statusCode);
    // },
    // getQuestions: async (req, res) => {
    //     let result = await Common.getQuestions(req.query);
    //     return helpers.showOutput(res, result, result.statusCode);
    // },
    // updateQuestion: async (req, res) => {
    //     let result = await Common.updateQuestion(req.body);
    //     return helpers.showOutput(res, result, result.statusCode);
    // },
    updateCommonContent: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Common.updateCommonContent(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...commonController
}