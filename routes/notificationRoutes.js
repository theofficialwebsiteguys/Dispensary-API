// routes/userRoutes.js
const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.put('/send-push', notificationController.sendPush);

module.exports = router;
