var express = require('express');
var commonController = require('../controllers/Common');
var router = express.Router();
var middleware = require("../controllers/middleware");

// without Token routes
router.post('/store_param', commonController.storeParameterToAWS);
router.post('/upload_file_to_s3', commonController.uploadFileToS3);
router.post('/upload_video_to_s3', commonController.uploadVideoToS3);
// router.post('/refresh', middleware.refreshToken);
// router.post('/get_terms_content', commonController.getTermsContent);
// router.post('/get_privacy_policy', commonController.getPrivacyContent);
// router.post('/get_about', commonController.getAbout);
// router.post('/get_questions', commonController.getQuestions);
// router.get('/get_param', commonController.fetchParameterFromAWS);
// router.post('/add_text_on_video', commonController.addTextOnVideo);

// with admin token routes
router.get('/get_categories', middleware.checkToken, commonController.getCategories);
router.get('/getAllCountries', commonController.getAllCountries);
router.get('/getAllStates', commonController.getAllStates);

// router.post('/get_common_data', middleware.checkToken, commonController.getCommonData);
// router.post('/update_common_data', middleware.checkToken, commonController.updateCommonData);
// router.post('/add_question', middleware.checkToken, commonController.addNewQuestion);
// router.post('/update_question', middleware.checkToken, commonController.updateQuestion);

// Common Routes
router.get('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;