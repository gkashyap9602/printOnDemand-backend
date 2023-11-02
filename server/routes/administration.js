var express = require('express');
var router = express.Router();
var adminController = require('../controllers/Administrator');
var { verifyTokenAdmin } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { saveNotification, addMaterial, updateWaitingList, deleteNotification } = require('../validations/administration')

// Admin Routes with Token
router.post('/addMaterial', verifyTokenAdmin, validate(addMaterial), adminController.addMaterial);
router.get('/getAllUsers', verifyTokenAdmin, adminController.getAllUsers);
router.post('/createCustomer', verifyTokenAdmin, adminController.createCustomer);
router.post('/updateWaitingList', verifyTokenAdmin, validate(updateWaitingList), adminController.updateWaitingList);
router.post('/saveNotification', verifyTokenAdmin, validate(saveNotification), adminController.saveNotification);
router.get('/getNotifications', verifyTokenAdmin, adminController.getNotifications);
router.delete('/deleteNotification', verifyTokenAdmin, validate(deleteNotification), adminController.deleteNotification);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;