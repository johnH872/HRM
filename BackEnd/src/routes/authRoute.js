import { Router } from "express";
const router = Router();

import authController from "../controllers/authController.js";

// router.route('/register').post(authController.register);
router.route('/login').post(authController.login);
router.route('/sendEmailResetPassword').post(authController.sendEmailResetPassword);
router.route('/resetPassword/:token').post(authController.changePassword);
router.route('/generateOTP').post(authController.generateOTP);
router.route('/validateOTP').post(authController.validateOTP);
router.route('/changePasswordOTP').post(authController.changePasswordOTP);
export default router;