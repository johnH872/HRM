import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;

class ReportScheduleController {
    async getReportSchedule(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const dataFilterReport = req.body;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new ReportScheduleController;