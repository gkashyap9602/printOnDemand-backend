var express = require('express');
var router = express.Router();
var authController = require('../controllers/Users');
var { verifyTokenUser, verifyTokenBoth, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { registrationSchema, loginSchema, forgotSchema, resetPasswordSchema, changePasswordSchema, profileSchema } = require('../validations/user')
const { addToMulter } = require('../services/helper')
// Users admin both routes with token
router.post('/logout', verifyTokenBoth, authController.logout);

// Users Routes without token
router.post('/register', addToMulter.single('profileImg'), validate(registrationSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);
router.post('/forgotPassword', validate(forgotSchema), authController.forgotPassword);
router.post('/resetPassword', validate(resetPasswordSchema), authController.resetPassword);

// with user token
router.post('/changePassword', validateCSRFToken, verifyTokenUser, validate(changePasswordSchema), authController.changePasswordWithOld);
router.post('/getAllOrders', validateCSRFToken, verifyTokenUser, authController.getAllOrders);
router.post('/updateBasicDetails', validateCSRFToken, verifyTokenUser, addToMulter.single('profileImg'), validate(profileSchema), authController.updateBasicDetails);
router.post('/updatePersonalDetails', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updatePersonalDetails);
router.post('/updateShippingDetails', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updateShippingDetails);
router.post('/updateBillingAddress', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updateBillingAddress);
router.post('/updatePaymentDetails', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updatePaymentDetails);
router.post('/generateStoreToken', validateCSRFToken, verifyTokenUser, authController.generateStoreToken);
router.get('/getUser/:user_id', verifyTokenUser, authController.getUserDetail);
router.get('/getUserStatus/:user_id', verifyTokenUser, authController.getUserStatus);
router.get('/getBulkImport', verifyTokenUser, authController.getBulkImport);
router.post('/refreshCsrfToken', verifyTokenUser, authController.refreshCsrfToken);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;