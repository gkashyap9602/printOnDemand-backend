var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/Users');
var middleware = require("../controllers/middleware");
var validate = require('../controllers/validationMiddleware')
const userValidation  = require('../validations/user')

// Users Routes without token
router.post('/register',validate(userValidation.registrationSchema), AuthController.register);
router.post('/login',validate(userValidation.loginSchema), AuthController.login);
router.post('/forgotPassword',validate(userValidation.forgotSchema), AuthController.forgotPassword);
router.post('/resetPassword',validate(userValidation.resetPasswordSchema), AuthController.resetPassword);

// with token
router.post('/changePassword',middleware.checkToken,validate(userValidation.changePasswordSchema), AuthController.changePasswordWithOld);
router.get('/getUser/:user_id', middleware.checkToken, AuthController.getUserDetail);
router.get('/getUserStatus/:user_id', middleware.checkToken, AuthController.getUserStatus);
// router.post('/createOrder', middleware.checkToken, AuthController.allOrders);
router.post('/getAllOrders', middleware.checkToken, AuthController.getAllOrders);
router.get('/getBulkImport', middleware.checkToken, AuthController.getBulkImport);
router.post('/logout',middleware.checkToken, AuthController.logout);
router.post('/updateBasicDetails', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updateBasicDetails);
router.post('/updateShippingDetails', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updateShippingDetails);
router.post('/updateBillingAddress', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updateBillingAddress);
router.post('/updatePaymentDetails', middleware.checkToken,validate(userValidation.profileSchema), AuthController.updatePaymentDetails);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;