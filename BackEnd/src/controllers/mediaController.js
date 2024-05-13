import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js';
import path from 'path';
import Resize from "../utils/resizeImage.js";
import 'dotenv/config';
import { uploadImage } from "../utils/cloundinary.js";
const dbContext = await db;

class roleController {
    async uploadProfileAvatar(req, res, next) {
        var result = new ReturnResult();
        try {
            // const assetsPath = './assets';
            // const imagePath = path.join(assetsPath, '/images');
            // // call class Resize
            // const fileUpload = new Resize(imagePath);
            // if (!req.file) {
            //     result.message = 'Please provide an image';
            //     return res.status(401).json(result);
            // }
            // const fileName = await fileUpload.save(req.file.buffer);
            // const port = process.env.PORT || 3000;
            // var saveUrl = `http://localhost:${port}/assets/images/${fileName}`;
            // Upload to cloundinary
            var imagePath = req.file.path;
            // Save image
            const __dirname = path.resolve(path.dirname(''));
            const uploadImagePath = path.join(__dirname, imagePath);
            var imageUrl = await uploadImage(uploadImagePath);

            var employeeId = req.params.id;
            if (employeeId) {
                await dbContext.User.update({
                    avatarUrl: imageUrl
                }, {
                    where: { userId: employeeId },
                });
                var employee = await dbContext.User.findByPk(employeeId);
                result.result = employee;
            }
        } catch (error) {
            console.log(error);
        }
        return res.status(200).json(result);
    }
}

export default new roleController;