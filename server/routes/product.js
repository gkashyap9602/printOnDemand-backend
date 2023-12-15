var express = require('express');
var router = express.Router();
var productController = require('../controllers/Product');
var { verifyTokenAdmin, verifyTokenBoth, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToMulter } = require('../services/helper/index')
const { addVariableType, addVariableOption, deleteVariable, updateVariable } = require("../validations/variable")
const { addProduct, addProductVarient, addProductImage, updateProduct, updateProductVarient,
    updateVarientTemplate, deleteVarientTemplate } = require("../validations/product")

// with user and admin Both token routes
router.get('/getProductDetails', verifyTokenBoth, productController.getProductDetails);
router.post('/getAllProducts', verifyTokenBoth, productController.getAllProduct);

// with admin token routes
router.post('/addProduct', validateCSRFToken, verifyTokenAdmin, validate(addProduct), productController.addProduct);
router.post('/addProductVarient', validateCSRFToken, verifyTokenAdmin, addToMulter.array('productVarientTemplates'), validate(addProductVarient), productController.addProductVarient);
router.post('/saveProductImage', validateCSRFToken, verifyTokenAdmin, addToMulter.single('productImage'), validate(addProductImage), productController.saveProductImage);
router.post('/updateProduct', validateCSRFToken, verifyTokenAdmin, addToMulter.single('productImage'), validate(updateProduct), productController.updateProduct);
router.post('/updateProductVarient', validateCSRFToken, verifyTokenAdmin, validate(updateProductVarient), productController.updateProductVarient);
router.post('/updateVarientTemplate', validateCSRFToken, verifyTokenAdmin, addToMulter.single('productVarientTemplates'), validate(updateVarientTemplate), productController.updateVarientTemplate);
router.delete('/deleteProduct/:productId', validateCSRFToken, verifyTokenAdmin, productController.deleteProduct);
router.delete('/deleteProductVarient', validateCSRFToken, verifyTokenAdmin, productController.deleteProductVarient);
router.delete('/deleteProductImage', validateCSRFToken, verifyTokenAdmin, productController.deleteProductImage);
router.delete('/deleteVarientTemplate', validateCSRFToken, verifyTokenAdmin, validate(deleteVarientTemplate), productController.deleteVarientTemplate);
router.post('/addVariableTypes', validateCSRFToken, verifyTokenAdmin, validate(addVariableType), productController.addVariableTypes);
router.post('/addVariableOptions', validateCSRFToken, verifyTokenAdmin, validate(addVariableOption), productController.addVariableOptions);
router.delete('/deleteVariable', validateCSRFToken, verifyTokenAdmin, validate(deleteVariable), productController.deleteVariable);
router.post('/updateVariable', validateCSRFToken, verifyTokenAdmin, validate(updateVariable), productController.updateVariable);
router.get('/getAllVariableTypes', verifyTokenAdmin, productController.getAllVariableTypes);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;




