var express = require('express');
var router = express.Router();
var adminController = require('../controllers/Administrator');
var { verifyTokenAdmin, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { saveNotification, addMaterial, updateWaitingList, deleteNotification } = require('../validations/administration')

// Admin Routes with Token
router.post('/addMaterial', validateCSRFToken, verifyTokenAdmin, validate(addMaterial), adminController.addMaterial);
router.post('/createCustomer', validateCSRFToken, verifyTokenAdmin, adminController.createCustomer);
router.post('/updateWaitingList', validateCSRFToken, verifyTokenAdmin, validate(updateWaitingList), adminController.updateWaitingList);
router.post('/saveNotification', validateCSRFToken, verifyTokenAdmin, validate(saveNotification), adminController.saveNotification);
router.delete('/deleteNotification', validateCSRFToken, verifyTokenAdmin, validate(deleteNotification), adminController.deleteNotification);
router.get('/getNotifications', verifyTokenAdmin, adminController.getNotifications);
router.get('/getAllUsers', verifyTokenAdmin, adminController.getAllUsers);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;