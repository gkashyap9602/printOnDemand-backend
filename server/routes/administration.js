var express = require('express');
var router = express.Router();
var adminController = require('../controllers/Administrator');
var { verifyTokenAdmin } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addMaterialSchema, updateWaitingList } = require('../validations/administration')

// without token
// router.post('/login', adminController.login);

// Admin Routes with Token
// router.post('/logout',middleware.verifyTokenAdmin, AdministratorController.logout);
router.post('/addMaterial', verifyTokenAdmin, validate(addMaterialSchema), adminController.addMaterial);
router.get('/getAllUsers', verifyTokenAdmin, adminController.getAllUsers);
router.post('/createCustomer', verifyTokenAdmin, adminController.createCustomer);
router.post('/updateWaitingList', verifyTokenAdmin, validate(updateWaitingList), adminController.updateWaitingList);

//admin Setting with admin routes
router.post('/add_question', verifyTokenAdmin, adminController.addNewQuestion);
router.post('/upload_answer_video',verifyTokenAdmin, adminController.uploadAnswerVideo);
router.post('/update_question', verifyTokenAdmin, adminController.updateQuestion);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;