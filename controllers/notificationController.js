// controllers/userController.js
const { Notification, User } = require('../models');
const { body } = require("express-validator");

exports.sendPush = async (req, res) => {
  const { userId, eventType, payload } = req.body;

  if (!userId || !eventType || !payload) {
    return res.status(400).json({ error: 'Invalid request structure' });
  }

  try {
    //Formatting of the notification
    const notificationData = {
      userId,
      eventType,
      title: payload.title || 'Default Title',
      message: payload.body,
      url: payload.url || '',
    };

    //Store the notification to the Database
    await saveNotificationToDatabase(notificationData);

    //Send the push notification
    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.message,
      },
      token: await getUserPushToken(userId),
    };

    const response = await getMessaging().send(message);

    res.status(200).json({ message: 'Notification pushed successfully', notificationId: response });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Failed to push notification' });
  }
};

async function saveNotificationToDatabase(data) {
  const notification = await Notification.create({
    userId: data.userId, // Ensure this matches an existing User ID
    eventType: data.eventType,
    title: data.title || null,
    message: data.message,
    url: data.url || null,
    status: 'unread',
  });
  return notification;
}

async function getUserPushToken(userId) {
  try {
    const user = await User.findByPk(userId, { attributes: ['pushToken'] });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!user.pushToken) {
      throw new Error(`Push token not found for user with ID ${userId}`);
    }

    return user.pushToken;
  } catch (error) {
    console.error('Error retrieving push token:', error.message);
    throw error;
  }
}

