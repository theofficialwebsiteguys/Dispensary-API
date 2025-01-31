const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/all', notificationController.getUserNotifications);

router.post('/send-push', notificationController.sendPush);

router.delete('/delete/:notificationId', notificationController.deleteNotification);

router.delete('/delete-all', notificationController.deleteAllNotifications);

router.put('/mark-read/:notificationId', notificationController.markNotificationAsRead);

router.put('/mark-all-read', notificationController.markAllNotificationsAsRead);


module.exports = router;
