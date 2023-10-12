var express = require('express');
var router = express.Router();
var authController = require('../controllers/Users');
var { verifyTokenUser, verifyTokenBoth } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { registrationSchema, loginSchema, forgotSchema, resetPasswordSchema, changePasswordSchema, profileSchema } = require('../validations/user')

// Users Routes without token
router.post('/register', validate(registrationSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgotPassword', validate(forgotSchema), authController.forgotPassword);
router.post('/resetPassword', validate(resetPasswordSchema), authController.resetPassword);


// Users admin both routes with token
router.post('/logout', verifyTokenBoth, authController.logout);


// with user token
router.post('/changePassword', verifyTokenUser, validate(changePasswordSchema), authController.changePasswordWithOld);
router.get('/getUser/:user_id', verifyTokenUser, authController.getUserDetail);
router.get('/getUserStatus/:user_id', verifyTokenUser, authController.getUserStatus);
router.post('/getAllOrders', verifyTokenUser, authController.getAllOrders);
router.get('/getBulkImport', verifyTokenUser, authController.getBulkImport);
router.post('/updateBasicDetails', verifyTokenUser, validate(profileSchema), authController.updateBasicDetails);
router.post('/updateShippingDetails', verifyTokenUser, validate(profileSchema), authController.updateShippingDetails);
router.post('/updateBillingAddress', verifyTokenUser, validate(profileSchema), authController.updateBillingAddress);
router.post('/updatePaymentDetails', verifyTokenUser, validate(profileSchema), authController.updatePaymentDetails);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;