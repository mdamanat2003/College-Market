import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import User from '../models/User';

const expo = new Expo();

/**
 * Send an Expo Push Notification to a specific push token
 */
export const sendExpoPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  if (!pushToken || typeof pushToken !== 'string') {
    return;
  }

  if (!Expo.isExpoPushToken(pushToken)) {
    console.warn(`[PushNotification] Invalid Expo push token: ${pushToken}`);
    return;
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('[PushNotification] Sent ticket:', ticketChunk);
    }
  } catch (error) {
    console.error('[PushNotification] Error sending push notification:', error);
  }
};

/**
 * Send an Expo Push Notification to a specific User by User ID
 */
export const sendPushNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  try {
    const user = await User.findById(userId).select('pushToken');
    if (user && user.pushToken) {
      await sendExpoPushNotification(user.pushToken, title, body, data);
    }
  } catch (error) {
    console.error(`[PushNotification] Failed to send push notification to user ${userId}:`, error);
  }
};

/**
 * Send Expo Push Notifications to multiple users by User IDs
 */
export const sendPushNotificationToUsers = async (
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  try {
    const users = await User.find({ _id: { $in: userIds }, pushToken: { $ne: '' } }).select('pushToken');
    const validTokens = users.map((u) => u.pushToken).filter((t): t is string => !!t && Expo.isExpoPushToken(t));

    if (validTokens.length === 0) return;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (error) {
    console.error('[PushNotification] Error sending bulk push notifications:', error);
  }
};
