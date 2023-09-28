var express = require('express');
var router = express.Router();
var AdministratorController = require('../controllers/Administrator');
var middleware = require("../controllers/middleware");
var validate = require('../controllers/validationMiddleware')
const adminValidation = require('../validations/administration')
const helpers = require('../services/helper/index')

// without token
router.post('/login', AdministratorController.login);
// router.post('/forgot', AdministratorController.forgotPasswordMail);
// router.post('/reset_password', AdministratorController.forgotChangePassword);

// Admin Routes with Token
router.post('/addCategory', middleware.checkToken, helpers.addToMulter.single('category'), validate(adminValidation.addCategorySchema), AdministratorController.addCategories);
router.post('/add_subcategory', middleware.checkToken, helpers.addToMulter.single('subcategory'), validate(adminValidation.addSubCategorySchema), AdministratorController.addSubCategories);
router.post('/add_material', middleware.checkToken, validate(adminValidation.addMaterialSchema), AdministratorController.addMaterial);
router.post('/addProduct', middleware.checkToken, AdministratorController.addProduct);
router.post('/get_product_details', middleware.checkToken, AdministratorController.getProductDetails);
router.post('/add_product_varient', middleware.checkToken, AdministratorController.addProductVarient);
router.post('/add_variable_type', middleware.checkToken, AdministratorController.addVariableTypes);
router.post('/add_variable_options', middleware.checkToken, AdministratorController.addVariableOptions);
router.get('/get_all_variable_types', middleware.checkToken, AdministratorController.getAllVariableTypes);
router.post('/saveProductImage', middleware.checkToken, helpers.addToMulter.single('productImage'), AdministratorController.saveProductImage);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;