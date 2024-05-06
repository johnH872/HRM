import { Router } from "express";
const router = Router();

import workCalendarController from "../controllers/workCalendarController.js";

router.route('/GetWorkCalendar').post(workCalendarController.getWorkCalendar);
router.route('/SaveWorkCalendar').post(workCalendarController.saveWorkCalendar);
router.route('/SaveWorkCalendarDetail').post(workCalendarController.saveWorkCalendarDetail);
router.route('/GetWorkCalendarByUserId').post(workCalendarController.getWorkCalendarByUserId);
router.route('/RemoveWorkCalendarDetails').post(workCalendarController.removeWorkCalendarDetails);

export default router;