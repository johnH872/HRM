import { Router } from "express";
const router = Router();

import leaveEntitlementController from "../controllers/leaveEntitlementController.js";

router.route('/GetAllLeaveEntitlement').get(leaveEntitlementController.getAllLeaveEntitlement);
router.route('/SaveLeaveEntitlement').post(leaveEntitlementController.saveLeaveEntitlement);

export default router;