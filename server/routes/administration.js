var express = require('express');
var router = express.Router();
var adminController = require('../controllers/Administrator');
var { verifyTokenAdmin, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { saveNotification, addMaterial, updateWaitingList, deleteNotification, addSubAdmin, activeInactiveuser, updateSubAdmin } = require('../validations/administration')

// Admin Routes with Token
router.post('/addMaterial', validateCSRFToken, verifyTokenAdmin, validate(addMaterial), adminController.addMaterial);
router.post('/createCustomer', verifyTokenAdmin, adminController.createCustomer);
router.post('/activeInactiveUser', verifyTokenAdmin, validate(activeInactiveuser), adminController.activeInactiveUser);
router.post('/updateWaitingList', validateCSRFToken, verifyTokenAdmin, validate(updateWaitingList), adminController.updateWaitingList);
router.post('/saveNotification', validateCSRFToken, verifyTokenAdmin, validate(saveNotification), adminController.saveNotification);
router.delete('/deleteNotification', validateCSRFToken, verifyTokenAdmin, validate(deleteNotification), adminController.deleteNotification);
router.get('/getNotifications', verifyTokenAdmin, adminController.getNotifications);
router.get('/getAllUsers', verifyTokenAdmin, adminController.getAllUsers);
router.post('/addSubAdmin', verifyTokenAdmin, validate(addSubAdmin), adminController.addSubAdmin);
router.post('/updateSubAdmin', verifyTokenAdmin, validate(updateSubAdmin), adminController.updateSubAdmin);
router.get('/getAllSubAdmins', verifyTokenAdmin, adminController.getAllSubAdmins);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;
