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
router.post('/addCategory' , verifyTokenAdmin, addToMulter.single('category'), validate(addCategorySchema), categoryController.addCategories);
router.post('/updateCategory', verifyTokenAdmin, addToMulter.single('category'), validate(updateCategorySchema), categoryController.updateCategory);
router.post('/addSubcategory', verifyTokenAdmin, addToMulter.single('subcategory'), validate(addSubCategorySchema), categoryController.addSubCategories);
router.post('/updateSubcategory', verifyTokenAdmin, addToMulter.single('subcategory'), validate(updateCategorySchema), categoryController.updateSubcategory);
router.delete('/deleteCategory/:id', verifyTokenAdmin, categoryController.deleteCategory);
router.delete('/deleteSubcategory/:id', verifyTokenAdmin, categoryController.deleteSubcategory);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;