var Users = require('../utils/Users');
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');

const authController = {

    register: async (req, res) => {
        let result = await Users.register(req.body);
        return helpers.showOutputNew(res, result, result.code);
    },

    login: async (req, res) => {
        let result = await Users.login(req.body);
        return helpers.showOutputNew(res, result, result.code);
    },

    forgotPassword: async (req, res) => {
        let result = await Users.forgotPassword(req.body);
        return helpers.showOutputNew(res, result, result.code);
    },

    resetPassword: async (req, res) => {
        let result = await Users.resetPassword(req.body);
        return helpers.showOutputNew(res, result, result.code);
    },

    changePasswordWithOld: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages.users.invalid_user), 403);
        }
        let result = await Users.changePasswordWithOld(req.body, user_id);
        return helpers.showOutputNew(res, result, result.code);
    },

    logout: async (req, res) => {
        let user_id = req.decoded?.user_id;
        if (!user_id) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.logout(req.body, user_id);
        return helpers.showOutputNew(res, result, result.code);
    },

    updateUser: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.updateUser(req.body, user_id);
        return helpers.showOutputNew(res, result, result.code);
    },
    updateUserBasicDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.updateUserBasicDetails(req.body, user_id);
        return helpers.showOutputNew(res, result, result.code);
    },
    updateShippingDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.updateShippingDetails(req.body, user_id);
        return helpers.showOutputNew(res, result, result.code);
    },

    updateBillingAddress: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.updateBillingAddress(req.body, user_id);
        return helpers.showOutputNew(res, result, result.code);
    },

    updatePaymentDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.updatePaymentDetails(req.body, user_id);
        return helpers.showOutputNew(res, result, result.code);
    },

    getUserDetail: async (req, res) => {
        console.log("contr")
        let result = await Users.getUserDetail(req?.params);
        return helpers.showOutputNew(res, result, result.code);
    },
    getAllOrders: async (req, res) => {
        console.log("controllerr")
        let result = await Users.getAllOrders(req?.query);
        return helpers.showOutputNew(res, result, result.code);
    },
// createOrder: async (req, res) => {
//     let user_id = req.decoded.user_id;
//     if (!user_id) {
//         return helpers.showOutputNew(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
//     }
//     let result = await Users.createOrder(req?.body,user_id);
//     return helpers.showOutputNew(res, result, result.code);
// },
    getUserStatus: async (req, res) => {
        let result = await Users.getUserStatus(req?.params);
        return helpers.showOutputNew(res, result, result.code);
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
    // markFrameUnlocked: async (req, res) => {

    //     let requiredFields = ['frame_name', "user_id"];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }

    //     let result = await Users.markFrameUnlocked(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // listReports: async (req, res) => {
    //     let requiredFields = ["page", "limit"];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.listReports(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // verifyUserInProgress: async (req, res) => {
    //     let requiredFields = ["user_id", "image"];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.verifyUserInProgress(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
}

module.exports = {
    ...authController
}