
var express = require('express');
var router = express.Router();
var productLibraryController = require('../controllers/ProductLibrary');
var middleware = require("../middleware/authentication");
var validate = require('../middleware/validation')
const helpers = require('../services/helper/index')

//user token routes
router.post('/saveLibraryImage', middleware.verifyTokenUser, productLibraryController.saveLibraryImage);
router.get('/getLibraryImages', middleware.verifyTokenUser, productLibraryController.getLibraryImages);


// Common Routes
router.get('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Get Request" }) });
router.post('*', (req, res) => { res.status(405).json({ status: false, message: "Invalid Post Request" }) });
module.exports = router;




