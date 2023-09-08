var express = require('express');
var router = express.Router();
var PaymentController = require('../controllers/Payment');
var middleware = require("../controllers/middleware");
// live token Route
router.post('/transfer', middleware.checkToken, PaymentController.transfer_amount);

router.post('/create_order', middleware.checkToken, PaymentController.create_order);
router.post('/transaction', middleware.checkToken, PaymentController.transactionList);

router.post('/payout', middleware.checkToken, PaymentController.payout);
router.post('/gift', middleware.checkToken, PaymentController.giftRicoPoints);
router.post('/getPlans', middleware.checkToken, PaymentController.getPlans);


//adminRoutes

router.post('/transactions', middleware.checkToken, PaymentController.transactionListParticularUser);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;