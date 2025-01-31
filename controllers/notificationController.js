const { Notification, User } = require('../models');
const admin = require('firebase-admin');
const path = require('path');
const AppError = require('../toolbox/appErrorClass');
const { getUserPushToken } = require('../toolbox/dispensaryTools');

// Load service account key JSON file
if (process.env.GOOGLE_CREDENTIALS) {
    serviceAccount = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf-8'));
} else {
    throw new Error("GOOGLE_CREDENTIALS environment variable is missing.");
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

exports.sendPush = async (req, res, next) => {
  try {
      const { userId, title, body } = req.body;

      if (!userId || !title || !body) {
          throw new AppError('Invalid request structure', 400, {
              field: ['userId', 'title', 'body'],
              issue: 'Missing required fields'
          });
      }

      // Retrieve user's push token
      const userToken = await getUserPushToken(userId);
      if (!userToken) {
          throw new AppError('User push token not found', 404, {
              field: 'userId',
              issue: `No push token found for user ID ${userId}`
          });
      }

      // Construct FCM message
      const message = {
          token: userToken,
          notification: { title, body },
          android: {
              priority: "high",
              notification: { sound: "default" }
          },
          apns: {
              payload: {
                  aps: {
                      sound: "default",
                      alert: { title, body }
                  }
              }
          }
      };

      // Send push notification
      const fcmResponse = await admin.messaging().send(message);

      // Save the notification to the database
      const savedNotification = await saveNotificationToDatabase({ userId, title, message: body });

      return res.status(200).json({
          message: 'Notification sent successfully',
          notificationId: savedNotification.id,
          fcmResponse: fcmResponse,
      });

  } catch (error) {
      next(error); // Pass errors to the global error handler
  }
};

// Save notification in the database
async function saveNotificationToDatabase(data) {
  try {
      return await Notification.create({
          userId: data.userId,
          title: data.title,
          message: data.message,
          status: 'unread',  // Mark notifications as unread by default
      });
  } catch (error) {
      throw new AppError('Error saving notification', 500, {
          field: 'database',
          issue: error.message
      });
  }
}


exports.getUserNotifications = async (req, res, next) => {
  try {
      const { userId } = req.query;  // Extract userId from query parameters

      // Ensure the user exists
      const user = await User.findByPk(userId);

      if (!user) {
          console.error(`User not found: ${userId}`);
          return res.status(404).json({ message: `User not found: ${userId}` });
      }

      // Retrieve all notifications for the user with the matching userId
      const notifications = await Notification.findAll({
          where: { userId: user.id },
      });

      // Return the notifications as a response
      return res.status(200).json(notifications);

  } catch (error) {
      // If any error occurs, throw a custom error with details
      return next(new AppError('Error retrieving notifications', 500, {
          field: 'database',
          issue: error.message
      }));
  }
};






exports.deleteNotification = async (req, res, next) => {
    try {
        const { notificationId } = req.params;
  
        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            return res.status(404).json({ message: `Notification not found` });
        }
  
        await notification.destroy();
        return res.status(200).json({ message: `Notification deleted successfully` });
  
    } catch (error) {
        return next(new AppError('Error deleting notification', 500, {
            field: 'database',
            issue: error.message
        }));
    }
  };
  

  exports.deleteAllNotifications = async (req, res, next) => {
    try {
        const { userId } = req.body;
  
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: `User not found` });
        }
  
        await Notification.destroy({ where: { userId } });
        return res.status(200).json({ message: `All notifications deleted successfully` });
  
    } catch (error) {
        return next(new AppError('Error deleting notifications', 500, {
            field: 'database',
            issue: error.message
        }));
    }
  };
  

  exports.markNotificationAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;
  
        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            return res.status(404).json({ message: `Notification not found` });
        }
  
        notification.status = 'read';
        await notification.save();
  
        return res.status(200).json({ message: `Notification marked as read successfully` });
  
    } catch (error) {
        return next(new AppError('Error marking notification as read', 500, {
            field: 'database',
            issue: error.message
        }));
    }
  };
  

  exports.markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const { userId } = req.body;
  
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: `User not found` });
        }
  
        await Notification.update({ status: 'read' }, { where: { userId } });
  
        return res.status(200).json({ message: `All notifications marked as read successfully` });
  
    } catch (error) {
        return next(new AppError('Error marking notifications as read', 500, {
            field: 'database',
            issue: error.message
        }));
    }
  };


  