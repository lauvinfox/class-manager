import express from "express";
import * as NotificationController from "@controllers/notification.controller";
import authenticate from "@middleware/authenticate";

const router = express.Router();

// Rute untuk mengirim notifikasi
router.post("/send", NotificationController.sendNotification);
router.get("/", authenticate, NotificationController.getNotifications);
router.patch("/markallread", NotificationController.markAllNotificationsAsRead);

export default router;
