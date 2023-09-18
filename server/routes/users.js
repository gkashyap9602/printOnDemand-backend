var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/Users');
var middleware = require("../controllers/middleware");
var validate = require('../controllers/validationMiddleware')
const {userProfileSchema}  = require('../validations/user')

// Users Routes without token
// router.post('/check_username_exist', AuthController.checkUsernameExistance);
// router.post('/suggest_username', AuthController.suggestUsername);
// router.post('/send_registration_code', AuthController.sendRegistrationCode);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
// router.post('/social_login', AuthController.socialLogin);
router.post('/forgot', AuthController.forgotPassword);
router.post('/reset_password', AuthController.resetPassword);
// router.post('/logout', AuthController.logout);
// router.post('/get', AuthController.getUserDetail);
// router.post('/search', AuthController.searchUser);

// with token

router.get('/:user_id', middleware.checkToken, AuthController.getUserDetail);
router.post('/update_basic_details', middleware.checkToken, AuthController.updateUserBasicDetails);
router.post('/update_shipping_details', middleware.checkToken, AuthController.updateShippingDetails);
router.post('/update_billing_address', middleware.checkToken, AuthController.updateBillingAddress);
router.post('/update_payment_details', middleware.checkToken,validate(userProfileSchema), AuthController.updatePaymentDetails);
router.post('/logout',middleware.checkToken, AuthController.logout);

// router.post('/follow', middleware.checkToken, AuthController.follow);
// router.post('/follower_list',  AuthController.followerList);
// router.post('/following_list',  AuthController.followingList);
// router.post('/like_comment', middleware.checkToken, AuthController.likeComment);
// router.post('/activate_frame', middleware.checkToken, AuthController.markFrameActive);
// router.post('/get_questions', middleware.checkToken, AuthController.getQuestions);
// router.post('/get_categories', middleware.checkToken, AuthController.getCategories);
// router.post('/report', middleware.checkToken, AuthController.reportUser);

// router.post('/verify_user', middleware.checkToken, AuthController.verifyUser);

// admin token Route
// router.post('/get_detail', middleware.checkToken, AuthController.getDetailByAdmin);
// router.post('/get_all_users', middleware.checkToken, AuthController.getAllUsers);
// router.post('/update_user', middleware.checkToken, AuthController.updateUserByAdmin);
// router.post('/unlock_frame', middleware.checkToken, AuthController.markFrameUnlocked);
// router.post('/report_list', middleware.checkToken, AuthController.listReports);
// router.post('/verify_face', middleware.checkToken, AuthController.verifyUserInProgress);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;