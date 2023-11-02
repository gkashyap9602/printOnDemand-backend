var express = require('express');
var router = express.Router();
var productController = require('../controllers/Product');
var { verifyTokenAdmin, verifyTokenBoth } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToMulter } = require('../services/helper/index')
const { addVariableType, addVariableOption } = require("../validations/variable")
const { addProduct, addProductVarient, addProductImage, updateProduct,updateProductVarient, 
       updateVarientTemplate, deleteVarientTemplate,} = require("../validations/product")

// with user and admin Both token routes
router.get('/getProductDetails', verifyTokenBoth, productController.getProductDetails);
router.post('/getAllProducts', verifyTokenBoth, productController.getAllProduct);

// with admin token routes
router.post('/addProduct', verifyTokenAdmin, validate(addProduct), productController.addProduct);
router.post('/addProductVarient', verifyTokenAdmin, addToMulter.array('productVarientTemplates'), validate(addProductVarient), productController.addProductVarient);
router.post('/saveProductImage', verifyTokenAdmin, addToMulter.single('productImage'), validate(addProductImage), productController.saveProductImage);
router.post('/updateProduct', verifyTokenAdmin, addToMulter.single('productImage'), validate(updateProduct), productController.updateProduct);
router.post('/updateProductVarient', verifyTokenAdmin, validate(updateProductVarient), productController.updateProductVarient);
router.post('/updateVarientTemplate', verifyTokenAdmin, addToMulter.single('productVarientTemplates'), validate(updateVarientTemplate), productController.updateVarientTemplate);
router.delete('/deleteProduct/:productId', verifyTokenAdmin, productController.deleteProduct);
router.delete('/deleteProductVarient', verifyTokenAdmin, productController.deleteProductVarient);
router.delete('/deleteProductImage', verifyTokenAdmin, productController.deleteProductImage);
router.delete('/deleteVarientTemplate', verifyTokenAdmin, validate(deleteVarientTemplate), productController.deleteVarientTemplate);
router.post('/addVariableTypes', verifyTokenAdmin, validate(addVariableType), productController.addVariableTypes);
router.post('/addVariableOptions', verifyTokenAdmin, validate(addVariableOption), productController.addVariableOptions);
router.get('/getAllVariableTypes', verifyTokenAdmin, productController.getAllVariableTypes);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;




