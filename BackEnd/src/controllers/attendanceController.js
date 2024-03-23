import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;
class attendanceController {
    async getAttendanceByEmployeeId(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const employeeId = req.params.id;
            const employeeAttendances = await dbContext.Attendance.findAll({
                where: { userId: employeeId },
                order: [
                    ['punchinDate', 'DESC'],
                    ['punchoutDate', 'DESC'],
                ]
            });
            returnResult.result = employeeAttendances || [];
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async punchInOut(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            returnResult.result = false;
            const isPunchIn = req.params.isPunchIn === 'true';
            const employeeId = req.params.id;
            const attendanceModel = req.body;
            if (isPunchIn) {
                const employeeAttendance = await dbContext.Attendance.create({
                    userId: employeeId,
                    punchinDate: attendanceModel.punchinDate,
                    punchinTime: new Date(attendanceModel.punchinDate).getTime(),
                    punchinNote: attendanceModel.punchinNote,
                    punchinOffset: new Date(attendanceModel.punchinDate).getTimezoneOffset(),
                    punchoutDate: null,
                    punchoutTime: null,
                    punchoutNote: null,
                    punchoutOffset: null
                });
                if (employeeAttendance) returnResult.result = true;
            } else {
                const employeeAttendance = await dbContext.Attendance.update(
                    {
                        punchoutDate: attendanceModel.punchoutDate,
                        punchoutTime: new Date(attendanceModel.punchoutDate).getTime(),
                        punchoutNote: attendanceModel.punchoutNote,
                        punchoutOffset: new Date(attendanceModel.punchoutDate).getTimezoneOffset()
                    },
                    {
                        where: {
                            userId: employeeId,
                            punchoutDate: null
                        }
                    });
                if (employeeAttendance) returnResult.result = true;
            }
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new attendanceController;