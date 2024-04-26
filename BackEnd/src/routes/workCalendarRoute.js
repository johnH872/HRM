import { Router } from "express";
const router = Router();

import workCalendarController from "../controllers/workCalendarController.js";

router.route('/GetWorkCalendar').post(workCalendarController.getWorkCalendar);
router.route('/SaveWorkCalendar').post(workCalendarController.saveWorkCalendar);

export default router;