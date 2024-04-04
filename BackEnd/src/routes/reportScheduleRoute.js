import { Router } from "express";
const router = Router();

import reportScheduleController from "../controllers/reportScheduleController.js";

router.route('/GetReportSchedule').post(reportScheduleController.getReportSchedule);

export default router;