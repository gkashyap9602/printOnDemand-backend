var Administration = require('../utils/Administration');
const helpers = require('../services/helper');
const adminController = {

    addMaterial: async (req, res) => {
        let result = await Administration.addMaterial(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateMaterial: async (req, res) => {
        let result = await Administration.updateMaterial(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    saveNotification: async (req, res) => {
        let result = await Administration.saveNotification(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getNotifications: async (req, res) => {
        let result = await Administration.getNotifications(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteNotification: async (req, res) => {
        let result = await Administration.deleteNotification(req.body);
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
    addShipMethod: async (req, res) => {
        let result = await Administration.addShipMethod(req.body);
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
    addSubAdmin: async (req, res) => {
        let adminId = req.decoded?.admin_id
        if (!adminId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Administration.addSubAdmin(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

    getAllSubAdmins: async (req, res) => {
        let adminId = req.decoded?.admin_id
        if (!adminId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Administration.getAllSubAdmins(req.query);
        return helpers.showOutput(res, result, result.statusCode);
    },
    activeInactiveUser: async (req, res) => {
        let result = await Administration.activeInactiveUser(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateSubAdmin: async (req, res) => {
        let result = await Administration.updateSubAdmin(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...adminController
}