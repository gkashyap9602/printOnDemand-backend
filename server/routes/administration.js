var express = require('express');
var router = express.Router();
var adminController = require('../controllers/Administrator');
var { verifyTokenAdmin, validateCSRFToken } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { saveNotification, addMaterial, updateMaterial, updateWaitingList, deleteNotification, updateCustomer, addSubAdmin, activeInactiveuser, updateSubAdmin, createCustomer } = require('../validations/administration')

// Admin Routes with Token----------------------

//material routes
router.post('/addMaterial', validateCSRFToken, verifyTokenAdmin, validate(addMaterial), adminController.addMaterial);
router.post('/updateMaterial', validateCSRFToken, verifyTokenAdmin, validate(updateMaterial), adminController.updateMaterial);

//customer routes
router.post('/createCustomer', verifyTokenAdmin, validate(createCustomer), adminController.createCustomer);
router.post('/updateCustomer', verifyTokenAdmin, validate(updateCustomer), adminController.updateCustomer);
router.post('/activeInactiveUser', verifyTokenAdmin, validate(activeInactiveuser), adminController.activeInactiveUser);
router.get('/getAllUsers', verifyTokenAdmin, adminController.getAllUsers);
router.get('/getCustomerDetails/:customerId', verifyTokenAdmin, adminController.getCustomerDetails);

//ship method routes
router.post('/addShipMethod', validateCSRFToken, verifyTokenAdmin, adminController.addShipMethod);


//notification routes
router.post('/saveNotification', verifyTokenAdmin, validate(saveNotification), adminController.saveNotification);
router.delete('/deleteNotification', verifyTokenAdmin, validate(deleteNotification), adminController.deleteNotification);
router.get('/getNotifications', verifyTokenAdmin, adminController.getNotifications);

//subadmin routes
router.post('/addSubAdmin', verifyTokenAdmin, validate(addSubAdmin), adminController.addSubAdmin);
router.post('/updateSubAdmin', verifyTokenAdmin, validate(updateSubAdmin), adminController.updateSubAdmin);
router.get('/getAllSubAdmins', verifyTokenAdmin, adminController.getAllSubAdmins);

//waiting list routes 
router.post('/updateWaitingList', verifyTokenAdmin, validate(updateWaitingList), adminController.updateWaitingList);

// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;
