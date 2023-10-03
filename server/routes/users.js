var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/Users');
var middleware = require("../middleware/authentication");
var validate = require('../middleware/validation')
const userValidation  = require('../validations/user')

// Users Routes without token
router.post('/register',validate(userValidation.registrationSchema), AuthController.register);
router.post('/login',validate(userValidation.loginSchema), AuthController.login);
router.post('/forgotPassword',validate(userValidation.forgotSchema), AuthController.forgotPassword);
router.post('/resetPassword',validate(userValidation.resetPasswordSchema), AuthController.resetPassword);

// with token
router.post('/changePassword',middleware.verifyTokenUser,validate(userValidation.changePasswordSchema), AuthController.changePasswordWithOld);
router.get('/getUser/:user_id', middleware.verifyTokenUser, AuthController.getUserDetail);
router.get('/getUserStatus/:user_id', middleware.verifyTokenUser, AuthController.getUserStatus);
// router.post('/createOrder', middleware.checkToken, AuthController.allOrders);
router.post('/getAllOrders', middleware.verifyTokenUser, AuthController.getAllOrders);
router.get('/getBulkImport', middleware.verifyTokenUser, AuthController.getBulkImport);
router.post('/logout',middleware.verifyTokenUser, AuthController.logout);
router.post('/updateBasicDetails', middleware.verifyTokenUser,validate(userValidation.profileSchema), AuthController.updateBasicDetails);
router.post('/updateShippingDetails', middleware.verifyTokenUser,validate(userValidation.profileSchema), AuthController.updateShippingDetails);
router.post('/updateBillingAddress', middleware.verifyTokenUser,validate(userValidation.profileSchema), AuthController.updateBillingAddress);
router.post('/updatePaymentDetails', middleware.verifyTokenUser,validate(userValidation.profileSchema), AuthController.updatePaymentDetails);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;