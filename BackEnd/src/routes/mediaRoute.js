import { Router } from "express";
const router = Router();
import mediaController from "../controllers/mediaController.js";
import upload from "../middlewares/uploadFile.js";

router.route('/UploadProfileAvatar/:id').post(upload.single('image') , mediaController.uploadProfileAvatar);

export default router;