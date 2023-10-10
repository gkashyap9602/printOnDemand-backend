var express = require('express');
var categoryController = require('../controllers/Category');
var router = express.Router();
var middleware = require("../middleware/authentication");
const helpers = require('../services/helper/index')
var validate = require('../middleware/validation')
const categoryValidation = require('../validations/category')

// with user and admin Both token routes
router.get('/getCategories', middleware.verifyTokenBoth, categoryController.getCategories);

// with Admin Token routes
router.post('/addCategory', middleware.verifyTokenAdmin, helpers.addToMulter.single('category'), validate(categoryValidation.addCategorySchema), categoryController.addCategories);
router.post('/updateCategory', middleware.verifyTokenAdmin, helpers.addToMulter.single('category'), validate(categoryValidation.updateCategorySchema), categoryController.updateCategory);
router.post('/addSubcategory', middleware.verifyTokenAdmin, helpers.addToMulter.single('subcategory'), validate(categoryValidation.addSubCategorySchema), categoryController.addSubCategories);
router.post('/updateSubcategory', middleware.verifyTokenAdmin, helpers.addToMulter.single('subcategory'), validate(categoryValidation.updateCategorySchema), categoryController.updateSubcategory);
router.delete('/deleteCategory/:id', middleware.verifyTokenAdmin, categoryController.deleteCategory);
router.delete('/deleteSubcategory/:id', middleware.verifyTokenAdmin, categoryController.deleteSubcategory);

// Common Routes
router.get('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Get Request"})});
router.post('*',(req,res) => {res.status(405).json({status:false, message:"Invalid Post Request"})});

module.exports = router;