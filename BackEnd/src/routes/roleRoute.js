import { Router } from "express";
const router = Router();
import roleController from "../controllers/roleController.js";

router.route('/GetRoles').get(roleController.getRoles);

export default router;