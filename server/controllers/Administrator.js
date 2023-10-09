var Administration = require('../utils/Administration');
const helpers = require('../services/helper');
const adminController = {

    login: async (req, res) => {
        let result = await Administration.login(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

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
        let result = await Administration.createCustomer(req.body,adminId);
        return helpers.showOutput(res, result, result.statusCode);
    },
    logout: async (req, res) => {
        let adminId = req.decoded?.admin_id;
        if (!adminId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Administration.logout(adminId);
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