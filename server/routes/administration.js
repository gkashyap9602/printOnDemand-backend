var express = require('express');
var router = express.Router();
var AdministratorController = require('../controllers/Administrator');
var middleware = require("../controllers/middleware");

// without token
// router.post('/login', AdministratorController.login);
// router.post('/forgot', AdministratorController.forgotPasswordMail);
// router.post('/reset_password', AdministratorController.forgotChangePassword);

// Admin Routes with Token
// router.post('/change_password', middleware.checkToken, AdministratorController.changePasswordWithOld);
// router.post('/get', middleware.checkToken, AdministratorController.getDetails);
// router.post('/update', middleware.checkToken, AdministratorController.update);
// router.post('/question', middleware.checkToken, AdministratorController.addQuestions);
// router.post('/category', middleware.checkToken, AdministratorController.addCreatorCategories);
// router.post('/get_category', middleware.checkToken, AdministratorController.getCreatorCategories);
// router.post('/update_category', middleware.checkToken, AdministratorController.updateCreatorCategories);
// router.post('/get_admin_data', middleware.checkToken, AdministratorController.getAdminData);

// router.post('/delete_report', middleware.checkToken, AdministratorController.deleteReport);


// router.post('/records', middleware.checkToken, AdministratorController.listRecords);


// Common Routes
router.get('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req, res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});
module.exports = router;