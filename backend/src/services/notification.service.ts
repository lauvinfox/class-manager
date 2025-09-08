import NotificationModel from "@models/notification.model";
import * as ClassService from "@services/class.service";
import { io } from "@server/server";

interface CreateNotificationParams {
  userId: string;
  message: string;
  type: string;
  classId: string;
  isRead?: boolean;
  classOwner?: string;
}

export const createNotification = async ({
  userId,
  message,
  type,
  classId,
  isRead = false,
  classOwner,
}: CreateNotificationParams) => {
  const notification = await NotificationModel.create({
    userId,
    message,
    type,
    classId,
    isRead,
    classOwner,
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
  classOwner,
}: {
  inviteeIds: string[];
  notificationType: string;
  message: string;
  classId: string;
  isRead: boolean;
  classOwner?: string;
}) => {
  // Buat notifikasi ke setiap user yang diundang
  const notifications = inviteeIds.map((id) => ({
    userId: id,
    type: notificationType,
    message: message,
    classId: classId,
    isRead: isRead,
    classOwner: classOwner,
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

export const respondToInvite = async ({
  notificationId,
  instructorId,
  inviteResponse,
}: {
  notificationId: string;
  instructorId: string;
  inviteResponse: "accepted" | "denied";
}) => {
  const notification = await NotificationModel.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  await ClassService.updateInstructorStatus({
    classId: notification.classId as string,
    instructorId,
    status: inviteResponse,
  });

  notification.status = inviteResponse;
  await notification.save();

  return notification;
};
