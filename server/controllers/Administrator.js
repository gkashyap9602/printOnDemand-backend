var Administration = require('../utils/Administration');
const helpers = require('../services/helper');
const adminController = {

    // login: async (req, res) => {
    //     let result = await Administration.login(req.body);
    //     return helpers.showOutput(res, result, result.statusCode);
    // },

    addMaterial: async (req, res) => {
        let result = await Administration.addMaterial(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateWaitingList: async (req, res) => {
        let result = await Administration.updateWaitingList(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllUsers: async (req, res) => {
        let result = await Administration.getAllUsers(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    createCustomer: async (req, res) => {
        let adminId = req.decoded?.admin_id
        if (!adminId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Administration.createCustomer(req.body, adminId);
        return helpers.showOutput(res, result, result.statusCode);
    },
    // admin functions
    uploadAnswerVideo: async (req, res) => {
        answerVideo(req, res, async (err) => {
            if (!req.file || err) {
                return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.NO_IMAGE), 203);
            }
            let { filename, mimetype } = req.file
            if (mimetype.indexOf("video") == -1) {
                return helpers.showOutput(res, helpers.showResponse(false, "Only Video File Accepted"), 203);
            }
            return helpers.showOutput(res, helpers.showResponse(true, ControllerMessages.UPLOADED, filename), 200);
        });
    },

    addNewQuestion: async (req, res) => {
        let requiredFields = ['question', 'answer'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.addNewQuestion(req.body);
        return helpers.showOutput(res, result, result.code);
    },
  
    updateQuestion: async (req, res) => {
        let requiredFields = ['ques_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ControllerMessages.INVALID_ADMIN), 403);
        }
        let result = await Administration.updateQuestion(req.body, req.body.ques_id);
        return helpers.showOutput(res, result, result.code);
    },

    // logout: async (req, res) => {
    //     let adminId = req.decoded?.admin_id;
    //     if (!adminId) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Administration.logout(adminId);
    //     return helpers.showOutput(res, result, result.statusCode);
    // },

}

module.exports = {
    ...adminController
}