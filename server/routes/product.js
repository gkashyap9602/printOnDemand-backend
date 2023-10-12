var express = require('express');
var router = express.Router();
var productController = require('../controllers/Product');
var { verifyTokenAdmin, verifyTokenBoth } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToMulter } = require('../services/helper/index')
const { addVariableTypeSchema, addVariableOptionSchema } = require("../validations/variable")
const { addProductSchema, addProductVarientSchema, addProductImageSchema, updateProductSchema,
    updateProductVarientSchema, updateVarientTemplateSchema, deleteVarientTemplateSchema,
} = require("../validations/product")


// with user and admin Both token routes
router.get('/getProductDetails', verifyTokenBoth, productController.getProductDetails);
router.post('/getAllProducts', verifyTokenBoth, productController.getAllProduct);

// with admin token routes
router.post('/addProduct', verifyTokenAdmin, validate(addProductSchema), productController.addProduct);
router.post('/addProductVarient', verifyTokenAdmin, addToMulter.array('productVarientTemplates'), validate(addProductVarientSchema), productController.addProductVarient);
router.post('/saveProductImage', verifyTokenAdmin, addToMulter.single('productImage'), validate(addProductImageSchema), productController.saveProductImage);
router.post('/updateProduct', verifyTokenAdmin, addToMulter.single('productImage'), validate(updateProductSchema), productController.updateProduct);
router.post('/updateProductVarient', verifyTokenAdmin, validate(updateProductVarientSchema), productController.updateProductVarient);
router.post('/updateVarientTemplate', verifyTokenAdmin, addToMulter.single('productVarientTemplates'), validate(updateVarientTemplateSchema), productController.updateVarientTemplate);
router.delete('/deleteProduct/:productId', verifyTokenAdmin, productController.deleteProduct);
router.delete('/deleteProductVarient', verifyTokenAdmin, productController.deleteProductVarient);
router.delete('/deleteProductImage', verifyTokenAdmin, productController.deleteProductImage);
router.delete('/deleteVarientTemplate', verifyTokenAdmin, validate(deleteVarientTemplateSchema), productController.deleteVarientTemplate);
router.post('/addVariableTypes', verifyTokenAdmin, validate(addVariableTypeSchema), productController.addVariableTypes);
router.post('/addVariableOptions', verifyTokenAdmin, validate(addVariableOptionSchema), productController.addVariableOptions);
router.get('/getAllVariableTypes', verifyTokenAdmin, productController.getAllVariableTypes);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;




