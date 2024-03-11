import { Router } from "express";
const router = Router();

import leaveTypeController from "../controllers/leaveTypeController.js";

router.route('/GetAllLeaveType').get(leaveTypeController.getAllLeaveType);
router.route('/SaveLeaveType').post(leaveTypeController.saveLeaveType);

export default router;