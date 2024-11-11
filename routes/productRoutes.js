// routes/userRoutes.js
const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.put('/send-push', productController.getProducts);

module.exports = router;
