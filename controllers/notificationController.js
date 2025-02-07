const { Notification, User } = require('../models');
const admin = require('firebase-admin');
const path = require('path');
const AppError = require('../toolbox/appErrorClass');
const { getUserPushToken } = require('../toolbox/dispensaryTools');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');

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

// Initialize Google Cloud Storage
const storage = new Storage({
    projectId: "YOUR_PROJECT_ID",
    keyFilename: path.join(__dirname, "../notification-image-key.json")
});

const bucketName = "the-website-guys";
const bucket = storage.bucket(bucketName);

// Configure Multer to use memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Middleware to process file uploads
 */
exports.uploadMiddleware = upload.single('file');

/**
 * Upload Notification Image to Google Cloud Storage
 */
exports.uploadNotificationImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileName = `notifications/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        // Upload image buffer
        await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype }
        });

        // Generate a signed URL for temporary access
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // Expires in 7 days
        });

        return res.status(200).json({ imageUrl: signedUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Failed to upload image', error });
    }
};


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


exports.sendPushToAllUsers = async (req, res, next) => {
    try {
        const { title, body, image } = req.body;

        if (!title || !body) {
            throw new AppError('Invalid request structure', 400, {
                field: ['title', 'body'],
                issue: 'Missing required fields'
            });
        }

        // Retrieve all users with push tokens
        const users = await User.findAll({
            where: { pushToken: { [Op.ne]: null } },
            attributes: ['id', 'pushToken']
        });

        if (!users.length) {
            throw new AppError('No users found with push tokens', 404, {
                field: 'users',
                issue: 'No users have a registered push token'
            });
        }

        const messages = users.map(user => ({
            token: user.pushToken,
            notification: {
                title,
                body,
                ...(image && { image })
            },
            android: {
                priority: "high",
                notification: {
                    sound: "default",
                    ...(image && { image })
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        alert: { title, body },
                        "mutable-content": 1
                    }
                }
            }
        }));

        // Send push notifications in bulk
        const fcmResponses = await Promise.all(
            messages.map(message => admin.messaging().send(message))
        );

        // Save notifications in database
        await Promise.all(users.map(user =>
            saveNotificationToDatabase({ userId: user.id, title, message: body })
        ));

        return res.status(200).json({
            message: 'Notifications sent successfully',
            sentCount: users.length,
            fcmResponses
        });

    } catch (error) {
        next(error);
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


  /**
 * Fetch carousel images from storage
 */
exports.getCarouselImages = async (req, res) => {
    try {
      const [files] = await bucket.getFiles({ prefix: 'Flower-Power/carousel' });
      const images = files.map(file => `https://storage.cloud.google.com/${bucketName}/${file.name}`);
  
      return res.status(200).json({ images });
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      return res.status(500).json({ message: 'Error fetching images', error });
    }
  };
  
  exports.replaceCarouselImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const replaceIndex = req.body.replaceIndex;
        if (replaceIndex === undefined || replaceIndex < 0 || replaceIndex > 10) {
            return res.status(400).json({ message: 'Invalid index provided' });
        }

        const fileName = `Flower-Power/carousel${replaceIndex}.jpg`;
        const file = bucket.file(fileName);

        // Upload the new image
        await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype }
        });

        // Generate a signed URL valid for 1 year
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
        });

        return res.status(200).json({ imageUrl: signedUrl, message: `Image at index ${replaceIndex} replaced successfully.` });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Failed to replace image', error });
    }
};

