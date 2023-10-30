var express = require('express');
var router = express.Router();
var adminController = require('../controllers/Administrator');
var { verifyTokenAdmin } = require("../middleware/authentication");
var validate = require('../middleware/validation')
const { saveNotificationSchema,addMaterialSchema,updateWaitingList } = require('../validations/administration')

// without token
// router.post('/login', adminController.login);

// Admin Routes with Token
// router.post('/logout',middleware.verifyTokenAdmin, AdministratorController.logout);
router.post('/addMaterial', verifyTokenAdmin, validate(addMaterialSchema), adminController.addMaterial);
router.get('/getAllUsers', verifyTokenAdmin, adminController.getAllUsers);
router.post('/createCustomer', verifyTokenAdmin, adminController.createCustomer);
router.post('/updateWaitingList', verifyTokenAdmin, validate(updateWaitingList), adminController.updateWaitingList);
router.post('/saveNotification', verifyTokenAdmin, validate(saveNotificationSchema), adminController.saveNotification);
router.get('/getNotifications', verifyTokenAdmin, adminController.getNotifications);



// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;