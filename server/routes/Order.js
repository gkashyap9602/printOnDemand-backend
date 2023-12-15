var express = require('express');
var orderController = require('../controllers/Order');
var router = express.Router();
var { verifyTokenUser, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToCart, updateCart, deleteCart, placeOrder, updateOrder } = require('../validations/order')

// user token access routes
router.post('/addToCart', validateCSRFToken, verifyTokenUser, validate(addToCart), orderController.addToCart);
router.post('/placeOrder', validateCSRFToken, verifyTokenUser, validate(placeOrder), orderController.placeOrder);
router.post('/updateOrderStatus', validateCSRFToken, verifyTokenUser, validate(updateOrder), orderController.updateOrderStatus);
router.post('/getAllOrders', verifyTokenUser, orderController.getAllOrders);
router.get('/getOrderDetails', verifyTokenUser, orderController.getOrderDetails);
router.post('/downloadOrderDetails', verifyTokenUser, orderController.downloadOrderDetails);
router.post('/updateCartItem', validateCSRFToken, verifyTokenUser, validate(updateCart), orderController.updateCartItem);
router.get('/getCartItems', verifyTokenUser, orderController.getCartItems);
router.delete('/removeItemsFromCart', validateCSRFToken, verifyTokenUser, orderController.removeItemsFromCart);
router.delete('/deleteCart', validateCSRFToken, verifyTokenUser, validate(deleteCart), orderController.deleteCart);


// Common Routes 
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;