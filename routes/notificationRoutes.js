// routes/notificationRoutes.js
const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.post('/send-push', notificationController.sendPush);

module.exports = router;
