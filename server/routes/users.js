var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/Users');
var middleware = require("../controllers/middleware");
var validate = require('../controllers/validationMiddleware')
const userValidation  = require('../validations/user')

// Users Routes without token
router.post('/register',validate(userValidation.registrationSchema), AuthController.register);
router.post('/login',validate(userValidation.loginSchema), AuthController.login);
router.post('/forgot',validate(userValidation.forgotSchema), AuthController.forgotPassword);
router.post('/reset_password',validate(userValidation.resetPasswordSchema), AuthController.resetPassword);

// with token
router.get('/getUser/:user_id', middleware.checkToken, AuthController.getUserDetail);
router.get('/get_user_status/:user_id', middleware.checkToken, AuthController.getUserStatus);
// router.post('/createOrder', middleware.checkToken, AuthController.allOrders);
router.post('/getAllOrders', middleware.checkToken, AuthController.getAllOrders);
router.get('/getBulkImport', middleware.checkToken, AuthController.getBulkImport);
router.post('/logout',middleware.checkToken, AuthController.logout);
router.post('/update_basic_details', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updateUserBasicDetails);
router.post('/update_shipping_details', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updateShippingDetails);
router.post('/update_billing_address', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updateBillingAddress);
router.post('/update_payment_details', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updatePaymentDetails);
router.post('/change_password',middleware.checkToken,validate(userValidation.changePasswordSchema), AuthController.changePasswordWithOld);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;