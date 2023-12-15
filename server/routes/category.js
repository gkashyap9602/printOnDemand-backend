var express = require('express');
var categoryController = require('../controllers/Category');
var router = express.Router();
var { verifyTokenAdmin, verifyTokenBoth, validateCSRFToken } = require("../middleware/authentication");
const { addToMulter } = require('../services/helper/index')
var validate = require('../middleware/validation')
const { addCategorySchema, addSubCategorySchema, updateCategorySchema } = require('../validations/category')

// with user and admin Both token routes
router.get('/getCategories', verifyTokenBoth, categoryController.getCategories);

// with Admin Token routes
router.post('/addCategory', validateCSRFToken, verifyTokenAdmin, addToMulter.single('category'), validate(addCategorySchema), categoryController.addCategories);
router.post('/updateCategory', validateCSRFToken, verifyTokenAdmin, addToMulter.single('category'), validate(updateCategorySchema), categoryController.updateCategory);
router.post('/addSubcategory', validateCSRFToken, verifyTokenAdmin, addToMulter.single('subcategory'), validate(addSubCategorySchema), categoryController.addSubCategories);
router.post('/updateSubcategory', validateCSRFToken, verifyTokenAdmin, addToMulter.single('subcategory'), validate(updateCategorySchema), categoryController.updateSubcategory);
router.delete('/deleteCategory/:id', validateCSRFToken, verifyTokenAdmin, categoryController.deleteCategory);
router.delete('/deleteSubcategory/:id', validateCSRFToken, verifyTokenAdmin, categoryController.deleteSubcategory);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;