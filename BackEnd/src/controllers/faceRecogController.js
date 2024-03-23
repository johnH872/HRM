import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
import { addFaceToModel } from "../utils/helper.js";
const dbContext = await db;

class faceRecogController {
    async traningUserFace(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            returnResult.result = await addFaceToModel(req.params.id);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
        res.status(200).json(returnResult);
    }
}

export default new faceRecogController;