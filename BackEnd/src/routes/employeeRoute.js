import { Router } from "express";
const router = Router();

import employeeController from "../controllers/employeeController.js";

router.route('/GetAllEmployee').get(employeeController.getAllEmployee);
router.route('/GetEmployeeCurrentUserRole').post(employeeController.getEmployeeCurrentUserRole);
router.route('/GetEmployeePaging').post(employeeController.getEmployeePaging);
router.route('/SaveEmployee').post(employeeController.saveEmployee);
router.route('/getEmployeeById/:id').get(employeeController.getEmployeeById);

export default router;