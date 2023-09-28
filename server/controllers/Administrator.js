var Administration = require('../utils/Administration');
const helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');
const adminController = {

    login: async (req, res) => {
        let result = await Administration.login(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

    addCategories: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.file_upload_error), 203);
        }
        let result = await Administration.addCategories(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addMaterial: async (req, res) => {
        let result = await Administration.addMaterial(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addProduct: async (req, res) => {
        let result = await Administration.addProduct(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getProductDetails: async (req, res) => {
        let result = await Administration.getProductDetails(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addProductVarient: async (req, res) => {
        let result = await Administration.addProductVarient(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    saveProductImage: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.file_upload_error), 203);
        }
        let result = await Administration.saveProductImage(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addSubCategories: async (req, res) => {
        if (!req.file) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.file_upload_error), 203);
        }
        let result = await Administration.addSubCategories(req.body, req.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addVariableTypes: async (req, res) => {
        let result = await Administration.addVariableTypes(req.body,);
        return helpers.showOutput(res, result, result.statusCode);
    },
    addVariableOptions: async (req, res) => {
        let result = await Administration.addVariableOptions(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllVariableTypes: async (req, res) => {
        let result = await Administration.getAllVariableTypes();
        return helpers.showOutput(res, result, result.statusCode);
    },
    // forgotPasswordMail: async (req, res) => {
    //     let requiredFields = ['email'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.forgotPasswordMail(req.body);
    //     return helpers.showOutput(res, result, result.statuscode);
    // },
    // forgotChangePassword: async (req, res) => {
    //     let requiredFields = ['otp', 'email', 'password'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Administration.forgotChangePassword(req.body);
    //     return helpers.showOutput(res, result, result.statuscode);
    // },

    // getDetails: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Administration.getDetails(admin_id);
    //     return helpers.showOutput(res, result, result.statuscode);
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
    //     return helpers.showOutput(res, result, result.statuscode);
    // },

    // update: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Administration.update(req.body, admin_id);
    //     return helpers.showOutput(res, result, result.statuscode);
    // },
    // getAdminData: async (req, res) => {

    //     let result = await Administration.getAdminData(req.body);
    //     return helpers.showOutput(res, result, result.statuscode);
    // },
}

module.exports = {
    ...adminController
}