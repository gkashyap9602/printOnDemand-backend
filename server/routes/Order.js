var express = require('express');
var orderController = require('../controllers/Order');
var router = express.Router();
var { verifyTokenAdmin, verifyTokenBoth, validateCSRFToken } = require("../middleware/authentication");
// var validate = require('../middleware/validation')
// const { addToGallery, deleteFromGallery } = require('../validations/administration')

// with Admin Token RoutesaddToGallery
router.post('/addToCart', orderController.addToCart);
// router.delete('/deleteFromGallery', verifyTokenAdmin, validate(deleteFromGallery), orderController.deleteFromGallery);

// with User and Admin both Token routes
// router.get('/getGallery', verifyTokenBoth, orderController.getGallery);

// Common Routes 
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;