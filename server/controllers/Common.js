var Common = require('../utils/Common');
var helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")
const videoMulterRef = helpers.addToMulter.array('rico_video')
const fileMulterRef = helpers.addToMulter.array('rico_file')
// const { exec } = require('child_process');
const upload = require('../services/upload')
const addText = upload.any('rico_video');
// const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
// const fs =require('fs')

const commonController = {

    storeParameterToAWS: async (req, res) => {
        let requiredFields = ['name', 'value'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.Message), 203);
        }
        let result = await Common.storeParameterToAWS(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    fetchParameterFromAWS: async (req, res) => {
        let requiredFields = ['name'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.Message), 203);
        }
        let result = await Common.fetchParameterFromAWS(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    uploadVideoToS3: async (req, res) => {
        videoMulterRef(req, res, async (err) => {
            if (err || !req.files) {
                return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.common?.no_video_file), 203);
            }
            let result = await helpers.uploadVideoToS3(req.files)
            return helpers.showOutput(res, result, result.code);
        })
    },

    uploadFileToS3: async (req, res) => {
        fileMulterRef(req, res, async (err) => {
            if (err || !req.files) {
                return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.common?.no_file), 203);
            }
            let result = await helpers.uploadFileToS3(req.files)
            return helpers.showOutput(res, result, result.code);
        })
    },
    getCategories: async (req, res) => {
        // let admin_id = req.decoded.admin_id;
        // if (!admin_id) {
        //     return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        // }
        
        let result = await Common.getCategories(req.query);
        return helpers.showOutputNew(res, result, result.code);
    },
    getAllCountries: async (req, res) => {
        let result = await Common.getAllCountries();
        return helpers.showOutputNew(res, result, result.code);
    },
    getAllStates: async (req, res) => {
        let result = await Common.getAllStates(req.query);
        return helpers.showOutputNew(res, result, result.code);
    },

    // getTermsContent: async (req, res) => {
    //     let result = await Common.getTermsContent();
    //     return helpers.showOutput(res, result, result.code);
    // },

    // getPrivacyContent: async (req, res) => {
    //     let result = await Common.getPrivacyContent();
    //     return helpers.showOutput(res, result, result.code);
    // },

    // getAbout: async (req, res) => {
    //     let result = await Common.getAbout();
    //     return helpers.showOutput(res, result, result.code);
    // },

    // getQuestions: async (req, res) => {
    //     let result = await Common.getQuestions();
    //     return helpers.showOutput(res, result, result.code);
    // },


    // addNewQuestion: async (req, res) => {
    //     let requiredFields = ['question', 'answer'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Common.addNewQuestion(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // updateQuestion: async (req, res) => {
    //     let requiredFields = ['ques_id'];
    //     let validator = helpers.validateParams(req, requiredFields);
    //     if (!validator.status) {
    //         return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
    //     }
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Common.updateQuestion(req.body, req.body.ques_id);
    //     return helpers.showOutput(res, result, result.code);
    // },

    // getCommonData: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Common.getCommonData();
    //     return helpers.showOutput(res, result, result.code);
    // },

    // updateCommonData: async (req, res) => {
    //     let admin_id = req.decoded.admin_id;
    //     if (!admin_id) {
    //         return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
    //     }
    //     let result = await Common.updateCommonData(req.body);
    //     return helpers.showOutput(res, result, result.code);
    // },




}

module.exports = {
    ...commonController
}