var express = require('express');
var galleryController = require('../controllers/Gallery');
var router = express.Router();
var { verifyTokenAdmin, verifyTokenBoth } = require("../middleware/authentication");
const { addToMulter } = require('../services/helper/index')
var validate = require('../middleware/validation')
// const { } = require('../validations/category')

// with Admin Token
router.post('/addToGallery', verifyTokenAdmin, addToMulter.single('Gallery'), galleryController.addToGallery);
router.post('/updateGallery', verifyTokenAdmin, addToMulter.single('Gallery'), galleryController.addToGallery);

// with User and Admin both Token routes
router.get('/getGallery', verifyTokenBoth, galleryController.addToGallery);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });

module.exports = router;