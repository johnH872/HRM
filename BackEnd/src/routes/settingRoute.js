import { Router } from "express";
const router = Router();
import settingController from "../controllers/settingController.js";

router.route('/GetAllSetting').get(settingController.getAllSetting);
router.route('/GetSettingByKeyAndGroup').get(settingController.getSettingByKeyAndGroup);
router.route('/GetSettingByGroup').get(settingController.getSettingByGroup);
router.route('/SaveSetting').post(settingController.saveSetting);

export default router;