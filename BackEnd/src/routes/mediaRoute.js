import { Router } from "express";
const router = Router();
import mediaController from "../controllers/mediaController.js";
import { basicUpload } from "../middlewares/multer.js";

router.route('/UploadProfileAvatar/:id').post(basicUpload.single('image') , mediaController.uploadProfileAvatar);

export default router;