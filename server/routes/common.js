var express = require('express');
var commonController = require('../controllers/Common');
var router = express.Router();
var { verifyTokenBoth, verifyTokenAdmin } = require("../middleware/authentication");
const csrf = require('csurf')
const validate = require('../middleware/validation')
const { addQuestionSchema, updateQuestionSchema, updateCommonContentSchema } = require('../validations/common')
// Middleware for CSRF protection
const csrfProtection = csrf({ cookie: true });


// without Token routes
router.post('/store_param', commonController.storeParameterToAWS);
router.get('/csrf', csrfProtection, commonController.csrfToken);
router.post('/transfer', csrfProtection, commonController.submitCsrfToken);

// with admin and user both token routes
router.get('/getAllCountries', verifyTokenBoth, commonController.getAllCountries);
router.get('/getAllStates', verifyTokenBoth, commonController.getAllStates);
router.get('/getMaterials', verifyTokenBoth, commonController.getMaterials);
router.get('/getWaitingListStatus', verifyTokenBoth, commonController.getWaitingListStatus);
router.get('/getCommonContent', verifyTokenBoth, commonController.getCommonContent);
router.get('/getQuestions', verifyTokenBoth, commonController.getQuestions);

// with admin token routes 
router.post('/addNewQuestion', verifyTokenAdmin, validate(addQuestionSchema), commonController.addNewQuestion);
router.post('/updateQuestion', verifyTokenAdmin, validate(updateQuestionSchema), commonController.updateQuestion);
router.post('/updateCommonContent', verifyTokenAdmin, validate(updateCommonContentSchema), commonController.updateCommonContent);
// router.post('/getCommonData', verifyTokenAdmin, commonController.getCommonData);
// router.post('/updateCommonData', verifyTokenAdmin, commonController.updateCommonData);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;