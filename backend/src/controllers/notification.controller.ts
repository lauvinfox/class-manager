import { UNAUTHORIZED } from "@constants/statusCodes";
import * as NotificationService from "@services/notification.service";
import appAssert from "@utils/appAssert";

import catchError from "@utils/error";
import { RequestHandler } from "express";
import { Types } from "mongoose";

export const sendNotification: RequestHandler = catchError(async (req, res) => {
  const { userId, message, type, classId } = req.body;

  // Validasi userId
  if (!Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  const notification = await NotificationService.createNotification({
    userId,
    message,
    type,
    classId,
    isRead: false,
  });

  return res
    .status(200)
    .json({ message: "Notification sent successfully", data: notification });
});

export const getNotifications: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  appAssert(userId, UNAUTHORIZED, "Invalid Access");

  const notifications = await NotificationService.getNotifications(userId);
  return res.status(200).json({
    message: "Notifications retrieved successfully",
    data: notifications,
  });
});

export const markAllNotificationsAsRead: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    appAssert(userId, UNAUTHORIZED, "UNAUTHORIZED");

    await NotificationService.markAllAsRead(userId);

    return res.status(200).json({
      message: "All notifications marked as read",
    });
  }
);

export const respondToInvite: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { notificationId } = req.params;
  const { inviteResponse } = req.body;

  appAssert(userId, UNAUTHORIZED, "UNAUTHORIZED");

  const response = await NotificationService.respondToInvite({
    notificationId,
    instructorId: userId,
    inviteResponse,
  });

  return res.status(200).json({
    message: "Invite response recorded successfully",
    data: response,
  });
});
