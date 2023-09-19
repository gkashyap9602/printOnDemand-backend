var Administration = require('../utils/Administration');
const helpers = require('../services/helper');
const path = require('path');
const ResponseMessages = require('../constants/ResponseMessages');
const adminController = {

    login: async (req, res) => {
        let result = await Administration.login(req.body);
        return helpers.showOutputNew(res, result, result.code);
    },

    addCategories: async (req, res) => {

        if (!req.file) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages.common.file_upload_error), 203);
        }
       
        let result = await Administration.addCategories(req.body, req.file);
        return helpers.showOutputNew(res, result, result.code);
    },
    addSubCategories: async (req, res) => {
        console.log(req.body,"reqbodyy")
        if (!req.file) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages.common.file_upload_error), 203);
        }
        let result = await Administration.addSubCategories(req.body, req.file);
        return helpers.showOutputNew(res, result, result.code);
    },
    // forgotPasswordMail: async (req, res) => {
    //     let requiredFields = ['email'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.forgotPasswordMail(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // addQuestions: async (req, res) => {
    //     let requiredFields = ['question', "answers", "correct_answer"];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.addQuestion(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // getCreatorCategories: async (req, res) => {
    //     let requiredFields = ['page', 'limit'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.getCreatorCategories(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // forgotChangePassword: async (req, res) => {
    //     let requiredFields = ['otp', 'email', 'password'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.forgotChangePassword(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // getDetails: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Administration.getDetails(admin_id);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // changePasswordWithOld: async (req, res) => {
    //     let requiredFields = ['new_password', 'old_password'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Administration.changePasswordWithOld(req.body, admin_id);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // update: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Administration.update(req.body, admin_id);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // listRecords: async (req, res) => {
    //     let requiredFields = ['limit', 'page'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.listRecords(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // updateCreatorCategories: async (req, res) => {
    //     let requiredFields = ['_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.updateCreatorCategories(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // getAdminData: async (req, res) => {

    //     let result = await Administration.getAdminData(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // deleteReport: async (req, res) => {
    //     let requiredFields = ['_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.deleteReport(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
}

module.exports = {
    ...adminController
}