
var express = require('express');
var router = express.Router();
var productLibraryController = require('../controllers/ProductLibrary');
var { verifyTokenUser, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToMulter } = require('../services/helper/index')
const { updateProductLibrary, updateLibraryVarient, ProductLibraryDetails, deleteProductLibrary } = require('../validations/productLibrary')

//user token routes
router.post('/saveLibraryImage', validateCSRFToken, verifyTokenUser, addToMulter.single('libraryImage'), productLibraryController.saveLibraryImage);
router.get('/getLibraryImages', verifyTokenUser, productLibraryController.getLibraryImages);

////check
//product library routes
router.post('/create', validateCSRFToken, verifyTokenUser, addToMulter.array('productLibraryImg'), productLibraryController.createProductLibrary);
router.post('/update', validateCSRFToken, verifyTokenUser, validate(updateProductLibrary), productLibraryController.updateProductLibrary);
router.post('/updateVarient', validateCSRFToken, verifyTokenUser, validate(updateLibraryVarient), productLibraryController.updateProductLibraryVarient);
router.delete('/deleteProductLibrary', validateCSRFToken, verifyTokenUser, validate(deleteProductLibrary), productLibraryController.deleteProductLibrary);
router.post('/getLibrary', verifyTokenUser, productLibraryController.getProductLibrary);
router.get('/getLibraryDetails', verifyTokenUser, validate(ProductLibraryDetails), productLibraryController.getProductLibraryDetails);

//store routes
router.post('/addProductToStore', verifyTokenUser, productLibraryController.addProductToShopify);
// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;




