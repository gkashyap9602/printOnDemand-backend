var Users = require('../utils/Users');
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');
const crypto = require('crypto')

const authController = {

    register: async (req, res) => {
        let result = await Users.register(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

    login: async (req, res) => {
        let result = await Users.login(req.body, req, res);

        console.log(req.session, " session after login ")
        console.log(req.cookies, " cookies after login ")
        return helpers.showOutput(res, result, result.statusCode);
    },

    forgotPassword: async (req, res) => {
        let result = await Users.forgotPassword(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

    resetPassword: async (req, res) => {
        let result = await Users.resetPassword(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

    changePasswordWithOld: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.users.invalid_user), 403);
        }
        let result = await Users.changePasswordWithOld(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },

    logout: async (req, res) => {
        console.log(req.decoded, "decode")
        let userId = req.decoded?._id;
        if (!userId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.logout(req.body, userId);
        if (result.status) {
            res.clearCookie('_csrfToken')
            console.log(req.cookies,"after clear cookies logout")
        }
        return helpers.showOutput(res, result, result.statusCode);
    },

    updateBasicDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Users.updateBasicDetails(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateShippingDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Users.updateShippingDetails(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },

    updateBillingAddress: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Users.updateBillingAddress(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },

    updatePaymentDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.updatePaymentDetails(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },

    getUserDetail: async (req, res) => {
        let result = await Users.getUserDetail(req?.params);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getUserStatus: async (req, res) => {
        let result = await Users.getUserStatus(req?.params);
        return helpers.showOutput(res, result, result.statusCode);
    },
    // createOrder: async (req, res) => {
    //     let user_id = req.decoded.user_id;
    //     if (!user_id) {
    //         return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Users.createOrder(req?.body,user_id);
    //     return helpers.showOutputNew(res, result, result.code);
    // },
    getAllOrders: async (req, res) => {
        let result = await Users.getAllOrders(req?.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getBulkImport: async (req, res) => {
        let result = await Users.getBulkImport(req?.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    // // admin panel
    // getAllUsers: async (req, res) => {
    //     let requiredFields = ["page", "limit"];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Users.getAllUsers(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // getDetailByAdmin: async (req, res) => {
    //     let requiredFields = ['_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Users.getUserDetail(req.body._id);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // updateUserByAdmin: async (req, res) => {
    //     let requiredFields = ['user_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Users.updateUserAdmin(req.body, req.body.user_id);
    //     return helpers.showOutput(res, result, result.code);
    // },
}

module.exports = {
    ...authController
}