var express = require('express');
var orderController = require('../controllers/Order');
var router = express.Router();
var { verifyTokenUser, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToCart } = require('../validations/order')

// user token acces routes
router.post('/addToCart', verifyTokenUser, validate(addToCart), orderController.addToCart);
router.get('/getCartItems', verifyTokenUser, orderController.getCartItems);

// router.delete('/deleteFromGallery', verifyTokenAdmin, validate(deleteFromGallery), orderController.deleteFromGallery);


// Common Routes 
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;