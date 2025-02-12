const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/all', notificationController.getUserNotifications);

router.post('/sendPushToAll', notificationController.sendPushToAllUsers);
router.post('/sendPushByCategory', notificationController.notifyUsersByCategory);

router.post('/send-push', notificationController.sendPush);
router.post('/upload-image', notificationController.uploadMiddleware, notificationController.uploadNotificationImage);

router.delete('/delete/:notificationId', notificationController.deleteNotification);
router.delete('/delete-all', notificationController.deleteAllNotifications);

router.put('/mark-read/:notificationId', notificationController.markNotificationAsRead);
router.put('/mark-all-read', notificationController.markAllNotificationsAsRead);

router.get('/images', notificationController.getCarouselImages);
router.post('/replace', notificationController.uploadMiddleware, notificationController.replaceCarouselImage);

module.exports = router;
