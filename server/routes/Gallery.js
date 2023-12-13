var express = require('express');
var galleryController = require('../controllers/Gallery');
var router = express.Router();
var { verifyTokenAdmin, verifyTokenBoth, validateCSRFToken } = require("../middleware/authentication");
const { addToMulter } = require('../services/helper/index')
var validate = require('../middleware/validation')
const { addToGallery, deleteFromGallery } = require('../validations/administration')

// with Admin Token Routes
router.post('/addToGallery', validateCSRFToken, verifyTokenAdmin, addToMulter.single('Gallery'), validate(addToGallery), galleryController.addToGallery);
router.delete('/deleteFromGallery', validateCSRFToken, verifyTokenAdmin, validate(deleteFromGallery), galleryController.deleteFromGallery);

// with User and Admin both Token routes
router.get('/getGallery', verifyTokenBoth, galleryController.getGallery);

// Common Routes 
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;