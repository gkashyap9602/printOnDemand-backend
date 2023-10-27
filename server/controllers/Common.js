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
    getAllStates: async (req, res) => {
        let result = await Common.getAllStates(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getWaitingListStatus: async (req, res) => {
        let result = await Common.getWaitingListStatus(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    //
    csrfToken: async (req, res) => {
        console.log(req, "reqqcsrfTokenn");
        console.log(req?.csrfToken, "csrfTokenn");
        console.log(req.cookies, 'cookies');
        // let csrfToken = req?.csrfToken()
        // console.log(csrfToken, "csrf Token");
        let result = await Common.csrfToken(csrfToken);
        res.send(result.data)
        // return helpers.showOutput(res, result, result.statusCode);
    },
    submitCsrfToken: async (req, res) => {
        let csrfToken = req?.csrfToken()
        console.log(csrfToken, "controller csrf Token");
        let result = await Common.submitCsrfToken(req.body, csrfToken);
        return helpers.showOutput(res, result, result.statusCode);
    },
    //
    getQuestions: async (req, res) => {
        let result = await Common.getQuestions(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getCommonContent: async (req, res) => {
        let result = await Common.getCommonContent();
        return helpers.showOutput(res, result, result.statusCode);
    },
    addNewQuestion: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.admin.invalid_admin), 403);
        }
        let result = await Common.addNewQuestion(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

    updateQuestion: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.admin.invalid_admin), 403);
        }
        let result = await Common.updateQuestion(req.body, req.body.quesId);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateCommonContent: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Common.updateCommonContent(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    // admin functions
    // uploadAnswerVideo: async (req, res) => {
    //     answerVideo(req, res, async (err) => {
    //         if (!req.file || err) {
    //             return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.NO_IMAGE), 203);
    //         }
    //         let { filename, mimetype } = req.file
    //         if (mimetype.indexOf("video") == -1) {
    //             return helpers.showOutput(res, helpers.showResponse(false, "Only Video File Accepted"), 203);
    //         }
    //         return helpers.showOutput(res, helpers.showResponse(true, ControllerMessages.UPLOADED, filename), 200);
    //     });
    // },

    // getCommonData: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
    //     }
    //     let result = await Common.getCommonData();
    //     return helpers.showOutput(res, result, result.statusCode);
    // },
    // updateCommonData: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
    //     }
    //     let result = await Common.updateCommonData(req.body);
    //     return helpers.showOutput(res, result, result.statusCode);
    // },

}

module.exports = {
    ...commonController
}