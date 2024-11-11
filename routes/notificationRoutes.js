// routes/userRoutes.js
const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.put('/send-push', notificationController.redeem);

module.exports = router;
