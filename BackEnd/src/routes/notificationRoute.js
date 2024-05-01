import { Router } from "express";
const router = Router();

import notificationController from "../controllers/notificationController.js";

router.route('/GetAllNotification/:userId').get(notificationController.getAllNotification);
router.route('/saveFCMToken/:userId').post(notificationController.saveFCMToken);
router.route('/markRead/:userId/:notificationId').post(notificationController.markRead);

export default router;