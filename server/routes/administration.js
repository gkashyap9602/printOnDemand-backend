var express = require('express');
var router = express.Router();
var adminController = require('../controllers/Administrator');
var { verifyTokenAdmin, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { saveNotification, addMaterial, updateMaterial, updateWaitingList, deleteNotification, addSubAdmin, activeInactiveuser, updateSubAdmin } = require('../validations/administration')

// Admin Routes with Token
router.post('/addMaterial', verifyTokenAdmin, validate(addMaterial), adminController.addMaterial);
router.post('/updateMaterial', verifyTokenAdmin, validate(updateMaterial), adminController.updateMaterial);
router.post('/createCustomer', verifyTokenAdmin, adminController.createCustomer);
router.post('/activeInactiveUser', verifyTokenAdmin, validate(activeInactiveuser), adminController.activeInactiveUser);
router.post('/updateWaitingList', verifyTokenAdmin, validate(updateWaitingList), adminController.updateWaitingList);
router.post('/saveNotification', verifyTokenAdmin, validate(saveNotification), adminController.saveNotification);
router.post('/addSubAdmin', verifyTokenAdmin, validate(addSubAdmin), adminController.addSubAdmin);
router.post('/addShipMethod', verifyTokenAdmin, adminController.addShipMethod);
router.post('/updateSubAdmin', verifyTokenAdmin, validate(updateSubAdmin), adminController.updateSubAdmin);
router.delete('/deleteNotification', verifyTokenAdmin, validate(deleteNotification), adminController.deleteNotification);
router.get('/getAllUsers', verifyTokenAdmin, adminController.getAllUsers);
router.get('/getNotifications', verifyTokenAdmin, adminController.getNotifications);
router.get('/getAllSubAdmins', verifyTokenAdmin, adminController.getAllSubAdmins);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;
