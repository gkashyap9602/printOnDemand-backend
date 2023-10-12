var express = require('express');
var commonController = require('../controllers/Common');
var router = express.Router();
var { verifyTokenBoth } = require("../middleware/authentication");

// without Token routes
router.post('/store_param', commonController.storeParameterToAWS);

// with admin token routes
router.get('/getAllCountries', verifyTokenBoth, commonController.getAllCountries);
router.get('/getAllStates', verifyTokenBoth, commonController.getAllStates);
router.get('/getMaterials', verifyTokenBoth, commonController.getMaterials);
router.get('/getWaitingListStatus', verifyTokenBoth, commonController.getWaitingListStatus);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;