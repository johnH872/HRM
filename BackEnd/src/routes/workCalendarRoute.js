import { Router } from "express";
const router = Router();

import workCalendarController from "../controllers/workCalendarController.js";

router.route('/GetWorkCalendar').post(workCalendarController.getReportSchedule);

export default router;