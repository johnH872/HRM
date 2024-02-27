import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;
class employeeController {
    async getEmployeePaging(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const employeePaging = await dbContext.User.findAll({where: {deletedAt: null}});
            returnResult.result = employeePaging;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new employeeController;