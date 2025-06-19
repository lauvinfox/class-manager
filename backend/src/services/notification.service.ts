import NotificationModel from "@models/notification.model";
import { io } from "@server/server";

interface CreateNotificationParams {
  userId: string;
  message: string;
  type: string;
}

export const createNotification = async ({
  userId,
  message,
  type,
}: CreateNotificationParams) => {
  const notification = await NotificationModel.create({
    userId,
    message,
    type,
  });

  io?.to(userId).emit("notification", notification);

  return notification;
};

export const getNotifications = async (userId: string) => {
  const notifications = await NotificationModel.find({ userId }).sort({
    createdAt: -1,
  });
  return notifications;
};

export const markAllAsRead = async (userId: string) => {
  return NotificationModel.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );
};
