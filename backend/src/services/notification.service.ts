import NotificationModel from "@models/notification.model";
import { io } from "@server/server";

interface CreateNotificationParams {
  userId: string;
  message: string;
  type: string;
  classId: string;
  isRead?: boolean;
}

export const createNotification = async ({
  userId,
  message,
  type,
  classId,
  isRead = false,
}: CreateNotificationParams) => {
  const notification = await NotificationModel.create({
    userId,
    message,
    type,
    classId,
    isRead,
  });

  io?.to(userId).emit("notification", notification);

  return notification;
};

export const createNotifications = async ({
  inviteeIds,
  notificationType,
  message,
  classId,
  isRead = false,
}: {
  inviteeIds: string[];
  notificationType: string;
  message: string;
  classId: string;
  isRead: boolean;
}) => {
  // Buat notifikasi ke setiap user yang diundang
  const notifications = inviteeIds.map((id) => ({
    userId: id,
    type: notificationType,
    message: message,
    classId: classId,
    isRead: isRead,
  }));

  await NotificationModel.insertMany(notifications);

  notifications.forEach((notif) => {
    if (io) {
      io.to(notif.userId.toString()).emit("notification", notif);
    }
  });
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
