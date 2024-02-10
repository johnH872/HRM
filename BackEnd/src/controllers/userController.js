import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;
class userController {
    async get(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const user = await dbContext.User.findOne({where: {firstName: 'Ta'}, include: {model: dbContext.Role}});
            returnResult.result = user;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new userController;