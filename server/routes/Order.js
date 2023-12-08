var express = require('express');
var orderController = require('../controllers/Order');
var router = express.Router();
var { verifyTokenUser, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToCart, updateCart, deleteCart, placeOrder } = require('../validations/order')

// user token acces routes
router.post('/addToCart', verifyTokenUser, validate(addToCart), orderController.addToCart);
router.post('/placeOrder', verifyTokenUser, validate(placeOrder), orderController.placeOrder);
router.post('/updateCartItem', verifyTokenUser, validate(updateCart), orderController.updateCartItem);
router.get('/getCartItems', verifyTokenUser, orderController.getCartItems);
router.get('/getAllOrders', verifyTokenUser, orderController.getAllOrders);

router.delete('/deleteCart', verifyTokenUser, validate(deleteCart), orderController.deleteCart);


// Common Routes 
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;