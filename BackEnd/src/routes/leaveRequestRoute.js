import { Router } from "express";
const router = Router();

import leaveRequestController from "../controllers/leaveRequestController.js";

router.route('/GetAllLeaveRequest').get(leaveRequestController.getAllLeaveRequest);
router.route('/SaveLeaveRequest').post(leaveRequestController.saveLeaveRequest);
router.route('/GetLeaveRequestByEmployeeId/:id').get(leaveRequestController.getLeaveRequestByEmployeeId);
router.route('/GetLeaveRequestByFilter/:id').post(leaveRequestController.getLeaveRequestByFilter);

export default router;