var express = require('express');
var commonController = require('../controllers/Common');
var router = express.Router();
var middleware = require("../controllers/middleware");

// without Token routes
router.post('/store_param', commonController.storeParameterToAWS);
// router.post('/upload_file_to_s3', commonController.uploadFileToS3);
// router.post('/upload_video_to_s3', commonController.uploadVideoToS3);

// with admin token routes
router.get('/get_categories', middleware.checkToken, commonController.getCategories);
router.get('/getAllCountries', commonController.getAllCountries);
router.get('/getAllStates', commonController.getAllStates);
router.get('/get_materials', middleware.checkToken, commonController.getMaterials);



// Common Routes
router.get('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;