var express = require('express');
var router = express.Router();
var AdministratorController = require('../controllers/Administrator');
var middleware = require("../controllers/middleware");
var validate = require('../controllers/validationMiddleware')
const adminValidation = require('../validations/administration')
const categoryValidation = require('../validations/category')
const productValidation = require("../validations/product")
const helpers = require('../services/helper/index')
const variableValidation = require("../validations/variable")

// without token
router.post('/login', AdministratorController.login);
// router.post('/forgot', AdministratorController.forgotPasswordMail);
// router.post('/reset_password', AdministratorController.forgotChangePassword);

// Admin Routes with Token
router.post('/addCategory', middleware.checkToken, helpers.addToMulter.single('category'), validate(categoryValidation.addCategorySchema), AdministratorController.addCategories);
router.post('/addSubcategory', middleware.checkToken, helpers.addToMulter.single('subcategory'), validate(categoryValidation.addSubCategorySchema), AdministratorController.addSubCategories);
router.post('/addMaterial', middleware.checkToken, validate(adminValidation.addMaterialSchema), AdministratorController.addMaterial);
router.post('/addProduct', middleware.checkToken,validate(productValidation.addProductSchema), AdministratorController.addProduct);
router.post('/saveProductImage', middleware.checkToken, helpers.addToMulter.single('productImage'),validate(productValidation.addProductImageSchema), AdministratorController.saveProductImage);
router.post('/addProductVarient', middleware.checkToken,validate(productValidation.addProductVarientSchema), AdministratorController.addProductVarient);
router.get('/getProductDetails', middleware.checkToken, AdministratorController.getProductDetails);
router.post('/addVariableTypes', middleware.checkToken,validate(variableValidation.addVariableTypeSchema), AdministratorController.addVariableTypes);
router.post('/addVariableOptions', middleware.checkToken,validate(variableValidation.addVariableOptionSchema), AdministratorController.addVariableOptions);
router.get('/getAllVariableTypes', middleware.checkToken, AdministratorController.getAllVariableTypes);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;