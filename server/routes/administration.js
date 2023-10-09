var express = require('express');
var router = express.Router();
var AdministratorController = require('../controllers/Administrator');
var middleware = require("../middleware/authentication");
var validate = require('../middleware/validation')
const adminValidation = require('../validations/administration')

// without token
router.post('/login', AdministratorController.login);
// router.post('/forgot', AdministratorController.forgotPasswordMail);
// router.post('/reset_password', AdministratorController.forgotChangePassword);

// Admin Routes with Token
router.post('/addMaterial', middleware.verifyTokenAdmin, validate(adminValidation.addMaterialSchema), AdministratorController.addMaterial);
router.get('/getAllUsers', middleware.verifyTokenAdmin, AdministratorController.getAllUsers);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;