
var express = require('express');
var router = express.Router();
var storeController = require('../controllers/Store');
var { verifyTokenUser, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToMulter } = require('../services/helper/index')
const { saveShopInfo, getAllStores } = require('../validations/store')

//store routes
router.post('/saveShopInfo', verifyTokenUser, validate(saveShopInfo), storeController.saveShopInfo);
router.post('/getAllStores', verifyTokenUser, validate(getAllStores), storeController.getAllStores);


router.post('/updateStoreDetails', verifyTokenUser, storeController.updateStoreDetails);

router.post('/addProductToStore', verifyTokenUser, storeController.addProductToShopify);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;




