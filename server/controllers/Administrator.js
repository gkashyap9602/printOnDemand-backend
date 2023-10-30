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