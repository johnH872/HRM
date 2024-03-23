import { Router } from "express";
const router = Router();

import faceRecogController from "../controllers/faceRecogController.js";
import { customDirUpload } from "../middlewares/multer.js";

router.route('/traningUserFace/:id').post(customDirUpload.array('images', 40) ,faceRecogController.traningUserFace);

export default router;