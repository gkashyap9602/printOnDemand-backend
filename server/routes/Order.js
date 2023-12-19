var express = require('express');
var orderController = require('../controllers/Order');
var router = express.Router();
var { verifyTokenUser, validateCSRFToken, verifyTokenAdmin, verifyTokenBoth } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { addToCart, updateCart, deleteCart, placeOrder, updateOrder, updateOrderStatus ,getAllOrders} = require('../validations/order');
const { addToMulter } = require('../services/helper');

// user token access routes
router.post('/addToCart', verifyTokenUser, validate(addToCart), orderController.addToCart);
router.post('/placeOrder', verifyTokenUser, validate(placeOrder), orderController.placeOrder);
router.post('/updateOrderStatus', verifyTokenBoth, validate(updateOrderStatus), orderController.updateOrderStatus);
router.post('/updateOrder', verifyTokenBoth, validate(updateOrder), orderController.updateOrder);
router.post('/ordersBulkImport', verifyTokenBoth, addToMulter.single('bulkImport'), orderController.ordersBulkImport);

router.post('/getAllOrders', verifyTokenUser, orderController.getAllOrders);
router.get('/getOrderDetails', verifyTokenUser, orderController.getOrderDetails);
router.post('/downloadOrderDetails', verifyTokenUser, orderController.downloadOrderDetails);
router.post('/updateCartItem', verifyTokenUser, validate(updateCart), orderController.updateCartItem);
router.get('/getCartItems', verifyTokenUser, orderController.getCartItems);
router.delete('/removeItemsFromCart', verifyTokenUser, orderController.removeItemsFromCart);
router.delete('/deleteCart', verifyTokenUser, validate(deleteCart), orderController.deleteCart);

//admin routes
router.post('/getAllUserOrders', verifyTokenAdmin, orderController.getAllUserOrders);
router.get('/getUserOrderDetails', verifyTokenAdmin, orderController.getUserOrderDetails);
////
// Common Routes 
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;