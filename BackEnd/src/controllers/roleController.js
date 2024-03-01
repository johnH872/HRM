import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;

class roleController {
    async getRoles(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const result = await dbContext.Role.findAll({where: {deletedAt: null}});
            returnResult.result = result;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new roleController;