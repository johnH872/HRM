import { Router } from "express";
const router = Router();

import attendanceController from "../controllers/attendanceController.js";
import { attendanceUpload, basicUpload } from "../middlewares/multer.js";

router.route('/GetAllAttendance').get(attendanceController.getAllAttendance);
router.route('/SaveAttendance').post(attendanceController.saveAttendance);
// router.route('/register').post(authController.register);
router.route('/GetAttendanceByEmployeeId/:id').post(attendanceController.getAttendanceByEmployeeId);
router.route('/PunchInOut/:isPunchIn/:id').post(attendanceUpload.single('image'), attendanceController.punchInOut);
// router.route('/PunchInOutMobile/:isPunchIn/:id').post(basicUpload.single('image') , attendanceController.punchInOutMobile);
router.route('/SendAttendanceReport').post(attendanceUpload.single('image') , attendanceController.sendAttendanceReport);
router.route('/GetAllAttendanceReport/:email').get(attendanceController.getAllAttendanceReport);
router.route('/SaveAttendanceReport').post(attendanceController.saveAttendanceReport);
router.route('/DeleteAttendanceReport').post(attendanceController.deleteAttendanceReport);
router.route('/DeleteAttendance').post(attendanceController.deleteAttendance);
router.route('/GetAttendanceRange').post(attendanceController.getAttendanceRange);
export default router;