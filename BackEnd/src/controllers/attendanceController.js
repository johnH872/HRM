import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;
import path from 'path';
import * as canvas from 'canvas';
import * as faceapi from '@vladmandic/face-api'
import { Op, where } from "sequelize";
import { uploadImage } from "../utils/cloundinary.js";
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
class attendanceController {
    async getAttendanceByEmployeeId(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const employeeId = req.params.id;
            const dateRange = req.body;
            if (!dateRange) {
                dateRange = {
                    start: new Date(),
                    end: new Date()
                }
            }
            const employeeAttendances = await dbContext.Attendance.findAll({
                where: {
                    userId: employeeId,
                    punchinDate: {
                        [Op.gte]: new Date(dateRange.start),
                        [Op.lte]: new Date(dateRange.end),
                    }
                },
                order: [
                    ['punchinDate', 'DESC'],
                    ['punchoutDate', 'DESC'],
                ],
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
            const {model} =  req.body;
            const attendanceModel = JSON.parse(model);
            var imagePath = req.file.path;
            // Save image
            const __dirname = path.resolve(path.dirname(''));
            const userFolderPath = path.join(__dirname, imagePath);
            var imageUrl = await uploadImage(userFolderPath);
            if (isPunchIn) {
                const employeeAttendance = await dbContext.Attendance.create({
                    userId: employeeId,
                    punchinDate: attendanceModel.punchinDate,
                    punchinTime: new Date(attendanceModel.punchinDate).getTime(),
                    punchinNote: attendanceModel.punchinNote,
                    punchinOffset: new Date(attendanceModel.punchinDate).getTimezoneOffset(),
                    punchInImageUrl: imageUrl,
                    punchoutDate: null,
                    punchoutTime: null,
                    punchoutNote: null,
                    punchoutOffset: null,
                    punchOutImageUrl: null,
                });
                if (employeeAttendance) returnResult.result = true;
            } else {
                const employeeAttendance = await dbContext.Attendance.update(
                    {
                        punchOutImageUrl: imageUrl,
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

    // async punchInOutMobile(req, res, next) {
    //     var returnResult = new ReturnResult();
    //     try {
    //         // Detect face through image
    //         console.log(req.file)


    //         // await punchInOut();
    //     } catch (error) {
    //         res.status(400).json(error);
    //         console.log(error)
    //     }
    // }

    async sendAttendanceReport(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            returnResult.result = false;
            const model = req.body;
            var imagePath = req.file.path;
            // Save image
            const __dirname = path.resolve(path.dirname(''));
            const userFolderPath = path.join(__dirname, imagePath);
            var imageUrl = await uploadImage(userFolderPath);

            const attendanceReport = await dbContext.AttendanceReport.create({
                email: model.email,
                note: model.note,
                type: model.type,
                imageUrl
            });
            if (attendanceReport) returnResult.result = true;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new attendanceController;