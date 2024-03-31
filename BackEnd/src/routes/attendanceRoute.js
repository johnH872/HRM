import { Router } from "express";
const router = Router();

import attendanceController from "../controllers/attendanceController.js";
import { basicUpload } from "../middlewares/multer.js";

// router.route('/register').post(authController.register);
router.route('/GetAttendanceByEmployeeId/:id').post(attendanceController.getAttendanceByEmployeeId);
router.route('/PunchInOut/:isPunchIn/:id').post(attendanceController.punchInOut);
router.route('/PunchInOutMobile/:isPunchIn/:id').post(basicUpload.single('image') , attendanceController.punchInOutMobile);
export default router;