import { Router } from "express";
const router = Router();

import employeeController from "../controllers/employeeController.js";

router.route('/GetEmployeePaging').get(employeeController.getEmployeePaging);
router.route('/SaveEmployee').post(employeeController.saveEmployee);

export default router;