import { Router } from "express";
const router = Router();

import attendanceController from "../controllers/attendanceController.js";

// router.route('/register').post(authController.register);
router.route('/getAttendanceByEmployeeId/:id').post(attendanceController.getAttendanceByEmployeeId);
router.route('/punchInOut/:isPunchIn/:id').post(attendanceController.punchInOut);
export default router;