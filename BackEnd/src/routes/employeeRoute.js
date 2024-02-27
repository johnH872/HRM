import { Router } from "express";
const router = Router();

import employeeController from "../controllers/employeeController.js";

router.route('/GetEmployeePaging').get(employeeController.getEmployeePaging);

export default router;