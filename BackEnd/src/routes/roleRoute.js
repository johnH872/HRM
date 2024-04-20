import { Router } from "express";
const router = Router();
import roleController from "../controllers/roleController.js";

router.route('/GetRoles').get(roleController.getRoles);
router.route('/SaveRole').post(roleController.saveRole);
router.route('/DeleteRoles').post(roleController.deleteRoles);

export default router;