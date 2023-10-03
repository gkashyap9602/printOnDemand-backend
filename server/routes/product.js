
var express = require('express');
var router = express.Router();
var productController = require('../controllers/Product');
var middleware = require("../middleware/authentication");
var validate = require('../middleware/validation')
const productValidation = require("../validations/product")
const variableValidation = require("../validations/variable")

const helpers = require('../services/helper/index')

// with user and admin Both token routes
router.get('/getProductDetails', middleware.verifyTokenBoth, productController.getProductDetails);

// with admin token routes
router.post('/addProduct', middleware.verifyTokenAdmin,validate(productValidation.addProductSchema), productController.addProduct);
router.post('/saveProductImage', middleware.verifyTokenAdmin, helpers.addToMulter.single('productImage'),validate(productValidation.addProductImageSchema), productController.saveProductImage);
router.post('/addProductVarient', middleware.verifyTokenAdmin,validate(productValidation.addProductVarientSchema), productController.addProductVarient);

router.post('/updateProduct', middleware.verifyTokenAdmin, helpers.addToMulter.single('productImage'),validate(productValidation.updateProductSchema), productController.updateProduct);
router.post('/updateProductVarient', middleware.verifyTokenAdmin,validate(productValidation.addProductVarientSchema), productController.updateProductVarient);
router.delete('/deleteProductVarient', middleware.verifyTokenAdmin, productController.addProductVarient);

router.post('/addVariableTypes', middleware.verifyTokenAdmin,validate(variableValidation.addVariableTypeSchema), productController.addVariableTypes);
router.post('/addVariableOptions', middleware.verifyTokenAdmin,validate(variableValidation.addVariableOptionSchema), productController.addVariableOptions);
router.get('/getAllVariableTypes', middleware.verifyTokenAdmin, productController.getAllVariableTypes);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;




