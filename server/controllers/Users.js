var Users = require('../utils/Users');
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');

const authController = {

    // checkUsernameExistance: async (req, res) => {
    //     let requiredFields = ['username'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.checkUsernameExistance(req?.body?.username);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // suggestUsername: async (req, res) => {
    //     let requiredFields = ['username'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.suggestUsername(req?.body?.username);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // sendRegistrationCode: async (req, res) => {
    //     let requiredFields = ['input_source'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let input_source_validator = helpers.validateParams(req, [req.body.input_source]);
    //     if (!input_source_validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, input_source_validator.message), 203);
    //     }
    //     let result = await Users.sendRegistrationCode(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },

    register: async (req, res) => {
        let requiredFields = ['firstName', 'lastName', 'email', 'password'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }

        let result = await Users.register(req.body);
        console.log(result,"esulll")
        return helpers.showOutput(res, result, result.code);
    },

    login: async (req, res) => {
        let requiredFields = ['isLoginFromShopify', 'password', 'userName'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.login(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    // socialLogin: async (req, res) => {
    //     let requiredFields = ['device_id', 'os', 'fcm_token', 'login_source'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let { login_source } = req.body
    //     if (login_source == "facebook") {
    //         let validator = helpers.validateParams(req, ["fb_uid"]);
    //         if (!validator.status) {
    //             return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //         }
    //     } else if (login_source == "google") {
    //         let validator = helpers.validateParams(req, ["google_id"]);
    //         if (!validator.status) {
    //             return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //         }
    //     } else if (login_source == "apple") {
    //         let validator = helpers.validateParams(req, ["auth_token"]);
    //         if (!validator.status) {
    //             return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //         }
    //     } else {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.users?.invalid_login_source), 203);
    //     }
    //     let result = await Users.socialLogin(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },

    forgotPassword: async (req, res) => {
        let requiredFields = ['email'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let result = await Users.forgotPassword(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    resetPassword: async (req, res) => {
        let requiredFields = ['resetPasswordToken', 'newPassword','emailId'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }

        let result = await Users.resetPassword(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    // logout: async (req, res) => {
    //     let requiredFields = ['user_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.logout(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },

    updateUser: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Users.updateUser(req.body, user_id);
        return helpers.showOutput(res, result, result.code);
    },
    // follow: async (req, res) => {
    //     let requiredFields = ['user_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let user_id = req.decoded.user_id;
    //     console.log('followApiHit', user_id)
    //     if (!user_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Users.follow(req.body, user_id);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // likeComment: async (req, res) => {
    //     let requiredFields = ['_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let user_id = req.decoded.user_id;
    //     if (!user_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Users.likeComment(req.body, user_id);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // markFrameActive: async (req, res) => {
    //     let user_id = req.decoded.user_id;
    //     if (!user_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     req.body.user_id = user_id
    //     let result = await Users.markFrameActive(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // getUserDetail: async (req, res) => {
    //     let requiredFields = ['user_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.getUserDetail(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // getQuestions: async (req, res) => {

    //     let result = await Users.getQuestions(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // getCategories: async (req, res) => {

    //     let result = await Users.getCategories(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // followerList: async (req, res) => {
    //     let requiredFields = ['user_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.followerList(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // followingList: async (req, res) => {
    //     let requiredFields = ['user_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let result = await Users.followingList(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // verifyUser: async (req, res) => {
    //     let requiredFields = ['mode'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let user_id = req.decoded.user_id;
    //     if (!user_id) {
    //         let requiredFields = ['user_id',"status"];
    //         let validator = helpers.validateParams(req, requiredFields);
    //         if (!validator.status) {
    //             return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //         }
    //         user_id = req.body.user_id

    //     }
    //     req.body.user_id = user_id
    //     let result = await Users.verifyUser(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
    // searchUser: async (req, res) => {
    //     let requiredFields = ['keyword', "page", "limit"];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }

    //     let result = await Users.searchUser(req?.body);
    //     return helpers.showOutput(res, result, result.code);


    // },
    // reportUser: async (req, res) => {
    //     let requiredFields = ["video_id", "description"];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let user_id = req.decoded.user_id;
    //     if (!user_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     req.body.user_id = user_id
    //     let result = await Users.reportUser(req?.body);
    //     return helpers.showOutput(res, result, result.code);
    // },
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