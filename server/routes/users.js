var express = require('express');
var router = express.Router();
var authController = require('../controllers/Users');
var { verifyTokenUser, verifyTokenBoth, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { registrationSchema, loginSchema, forgotSchema, resetPasswordSchema, changePasswordSchema, profileSchema, updateSubmissionDelay } = require('../validations/user')
const { addToMulter } = require('../services/helper')


// Users Routes without token
router.post('/register', addToMulter.single('profileImg'), validate(registrationSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgotPassword', validate(forgotSchema), authController.forgotPassword);
router.post('/resetPassword', validate(resetPasswordSchema), authController.resetPassword);

// Users admin both routes with token
router.post('/logout', verifyTokenBoth, authController.logout);

// with user token acess Routes
router.post('/changePassword', validateCSRFToken, verifyTokenUser, validate(changePasswordSchema), authController.changePasswordWithOld);


//profile routes 
router.post('/updateBasicDetails', validateCSRFToken, verifyTokenUser, addToMulter.single('profileImg'), validate(profileSchema), authController.updateBasicDetails);
router.post('/updatePersonalDetails', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updatePersonalDetails);
router.post('/updateShippingDetails', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updateShippingDetails);
router.post('/updateBillingAddress', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updateBillingAddress);
router.post('/updatePaymentDetails', validateCSRFToken, verifyTokenUser, validate(profileSchema), authController.updatePaymentDetails);
router.post('/updateOrderSubmissionDelay', validateCSRFToken, verifyTokenUser, validate(updateSubmissionDelay), authController.updateOrderSubmissionDelay);
router.get('/getUser/:user_id', verifyTokenBoth, authController.getUserDetail);
router.get('/getUserStatus/:user_id', verifyTokenUser, authController.getUserStatus);

//csrf route
router.post('/refreshCsrfToken', authController.refreshCsrfToken);


//shopify routes
router.post('/updateStoreDetails', verifyTokenUser, validate(profileSchema), authController.updateBasicDetails);

// router.get('/generateStoreToken', authController.generateStoreToken);
// router.post('/shopifyAccess', authController.shopifyAccess);
// router.get('/redirect', authController.redirectShopify);
// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;