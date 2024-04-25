import { Router } from "express";
const router = Router();

import workCalendarController from "../controllers/workCalendarController.js";

router.route('/GetWorkCalendar').post(workCalendarController.getWorkCalendar);

export default router;