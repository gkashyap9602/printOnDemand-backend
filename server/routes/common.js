var express = require('express');
var commonController = require('../controllers/Common');
var router = express.Router();
var { verifyTokenBoth, verifyTokenAdmin, validateCSRFToken } = require("../middleware/authentication");
const validate = require('../middleware/validation')
const { addQuestionSchema, updateQuestionSchema, updateCommonContentSchema } = require('../validations/common')

//without Token Routes 
router.post('/store_param', commonController.storeParameterToAWS);

// with admin and user both token routes
router.get('/getAllCountries', verifyTokenBoth, commonController.getAllCountries);
router.get('/getAllStates', verifyTokenBoth, commonController.getAllStates);
router.get('/getMaterials', verifyTokenBoth, commonController.getMaterials);
router.get('/getWaitingListStatus', verifyTokenBoth, commonController.getWaitingListStatus);
router.get('/getCommonContent', verifyTokenBoth, commonController.getCommonContent);
router.get('/getQuestions', verifyTokenBoth, commonController.getQuestions);

// with admin token routes 
router.post('/addNewQuestion', validateCSRFToken, verifyTokenAdmin, validate(addQuestionSchema), commonController.addNewQuestion);
router.post('/updateQuestion', validateCSRFToken, verifyTokenAdmin, validate(updateQuestionSchema), commonController.updateQuestion);
router.post('/updateCommonContent', verifyTokenAdmin, validate(updateCommonContentSchema), commonController.updateCommonContent);
router.get('/fetchZendeskFAQs', commonController.fetchZendeskFAQs);
router.get('/TwofetchZendeskFAQs', commonController.TwofetchZendeskFAQs);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;
