import { Router } from "express";
const router = Router();

import attendanceController from "../controllers/attendanceController.js";
import { attendanceUpload, basicUpload } from "../middlewares/multer.js";

router.route('/GetAllAttendance').get(attendanceController.getAllAttendance);
// router.route('/register').post(authController.register);
router.route('/GetAttendanceByEmployeeId/:id').post(attendanceController.getAttendanceByEmployeeId);
router.route('/PunchInOut/:isPunchIn/:id').post(attendanceUpload.single('image'), attendanceController.punchInOut);
// router.route('/PunchInOutMobile/:isPunchIn/:id').post(basicUpload.single('image') , attendanceController.punchInOutMobile);
router.route('/SendAttendanceReport').post(attendanceUpload.single('image') , attendanceController.sendAttendanceReport);
export default router;