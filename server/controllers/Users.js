var Users = require('../utils/Users');
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');

const authController = {

    register: async (req, res) => {
        // if (!req.file) {
        //     return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages.common.no_file), 203);
        // }
        let result = await Users.register(req.body, req.file);
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
        let userId = req.decoded?._id;
        if (!userId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.logout(req.body, userId);
        if (result.status) {
            res.clearCookie('_csrfToken')
            req?.session?.destroy();
            console.log(req.cookies, "after clear cookies logout")
            console.log(req.session, "after destroy session logout")
        }
        return helpers.showOutput(res, result, result.statusCode);
    },

    updateBasicDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Users.updateBasicDetails(req.body, user_id, req?.file);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updatePersonalDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Users.updatePersonalDetails(req.body, user_id);
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
    generateStoreToken: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.generateStoreToken(req.body, user_id);
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
    refreshCsrfToken: async (req, res) => {
        let result = await Users.refreshCsrfToken(req);
        return helpers.showOutput(res, result, result.statusCode);
    },
}

module.exports = {
    ...authController
}