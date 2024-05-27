import { ReturnResult } from "../models/DTO/returnResult.js";
import 'dotenv/config';
import db from '../models/index.js'
const dbContext = await db;
import path from 'path';
import * as canvas from 'canvas';
import * as faceapi from '@vladmandic/face-api'
import { Op, where, literal } from "sequelize";
import { uploadImage } from "../utils/cloundinary.js";
import { leaveRequestStatus } from "../models/enums/leaveRequestStatus.js";
import { socketIO } from "../app.js";
import moment from "moment";
import { NotificationType } from "../models/enums/notificationType.js";
import { sendNotification } from "../utils/notification.js";
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
class attendanceController {
    async getAllAttendance(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const attendancePaging = await dbContext.Attendance.findAll({
                attributes: [
                    'attendanceId',
                    'userId',
                    'punchinDate',
                    'punchinTime',
                    'punchinNote',
                    'punchinOffset',
                    'punchoutDate',
                    'punchoutTime',
                    'punchoutNote',
                    'punchoutOffset',
                    'punchInImageUrl', 
                    'punchOutImageUrl',
                    [
                        literal(
                            `CASE 
                              WHEN ${'Attendance.punchoutTime'} > ${'Attendance.punchinTime'} 
                                  THEN (${'Attendance.punchoutTime'} - ${'Attendance.punchinTime'}) / 3600000
                              ELSE 0
                          END`
                        ),
                        'duration',
                    ],
                ],
                include: {
                    model: dbContext.User,
                    attributes: [
                        'userId',
                        'firstName',
                        'middleName',
                        'lastName',
                        'email',
                        'birth',
                        'gender',
                        'nationality',
                        'avatarUrl',
                        'phoneNumber',
                        'jobTitle',
                        'dateStartContract',
                        'ownerId',
                        'isAppliedFace',
                    ],
                },
                order: [
                    ['punchinDate', 'DESC']
                ]
            });
            returnResult.result = attendancePaging;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveAttendance(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.attendanceId === null || model.attendanceId === 0) { // Add new
                const saveAttendance = await dbContext.Attendance.create({
                    userId: model.userId,
                    punchinDate: model.punchinDate,
                    punchinTime: new Date(model.punchinDate).getTime(),
                    punchinNote: model.punchinNote,
                    punchinOffset: new Date(model.punchinDate).getTimezoneOffset(),
                    punchInImageUrl: null,
                    punchoutDate: model.punchoutDate,
                    punchoutTime: new Date(model.punchoutDate).getTime(),
                    punchoutNote: model.punchoutNote,
                    punchoutOffset: new Date(model.punchoutDate).getTimezoneOffset(),
                    punchOutImageUrl: null,
                });
                if (saveAttendance) {
                    result.result = saveAttendance;
                } else {
                    result.message = "Cannot save attendance";
                }
            } else { // Edit
                // Find existing attendance
                const existAttendance = await dbContext.Attendance.findOne({
                    where: {
                        attendanceId: model.attendanceId
                    }
                });
                if (existAttendance) {
                    const saveAttendance = await dbContext.Attendance.update({
                        userId: model.userId ?? existAttendance.userId,
                        punchinDate: model.punchinDate ?? existAttendance.punchinDate,
                        punchinTime: new Date(model.punchinDate).getTime() ?? existAttendance.punchinTime,
                        punchinNote: model.punchinNote ?? existAttendance.punchinNote,
                        punchinOffset: new Date(model.punchinDate).getTimezoneOffset() ?? existAttendance.punchinOffset,
                        punchInImageUrl: model.punchinImageUrl ?? existAttendance.punchInImageUrl,
                        punchoutDate: model.punchoutDate ?? existAttendance.punchoutDate,
                        punchoutTime: new Date(model.punchoutDate).getTime() ?? existAttendance.punchoutTime,
                        punchoutNote: model.punchoutNote ?? existAttendance.punchoutNote,
                        punchoutOffset: new Date(model.punchoutDate).getTimezoneOffset() ?? existAttendance.punchoutOffset,
                        punchOutImageUrl: model.punchOutImageUrl ?? existAttendance.punchoutImageUrl,
                    }, {
                        where: {
                            attendanceId: model.attendanceId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveAttendance) {
                        result.result = await dbContext.Attendance.findOne({
                            where: {
                                attendanceId: model.attendanceId
                            }
                        });
                    } else {
                        result.message = 'Can not save Attendance';
                    }
                } else {
                    result.message = 'Attendance not found';
                }
            }
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

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
            const { model } = req.body;
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
            if (returnResult.result) socketIO.emit(process.env.PUNCH_IN_OUT, {
                type: isPunchIn ? 'PUNCHIN' : 'PUNCHOUT',
                employeeId
            });
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
            model.statusId = leaveRequestStatus.WAITING;
            var imagePath = req.file.path;
            // Save image
            const __dirname = path.resolve(path.dirname(''));
            const userFolderPath = path.join(__dirname, imagePath);
            var imageUrl = await uploadImage(userFolderPath);

            const attendanceReport = await dbContext.AttendanceReport.create({
                email: model.email,
                note: model.note,
                type: model.type,
                statusId: model.statusId,
                imageUrl
            });

            const userModel = await dbContext.User.findOne({ where: { email: model.email } });
            if (userModel) {
                sendNotification(
                    'Attendance report', `${userModel.firstName || ''} ${userModel.middleName || ''} ${userModel.lastName || ''} submitted an attendance report.`,
                    '/admin/attendance-report',
                    NotificationType.ATTENDANCE_REPORT,
                    userModel.ownerId
                );
            }

            if (attendanceReport) returnResult.result = true;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async getAllAttendanceReport(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const { email } = req.params;
            const attendanceReports = await dbContext.AttendanceReport.findAll({
                // where: {
                //     email
                // }
                include:
                {
                    model: dbContext.DataState,
                    as: 'status'
                },
            });
            returnResult.result = attendanceReports;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveAttendanceReport(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            returnResult.result = false;
            const { statusId, attendanceReportId, reasonRejected } = req.body;
            const userId = req.query.userId;
            const oldAttendanceReport = await dbContext.AttendanceReport.findByPk(attendanceReportId);
            var oldStatusId = oldAttendanceReport.statusId;
            const updatedRes = await dbContext.AttendanceReport.update({
                statusId,
                reasonRejected
            }, {
                where: {
                    attendanceReportId
                }
            });
            if (updatedRes) {
                returnResult.result = true;
            }
            // Update attendance data when attendance has been approved
            if (oldStatusId == 1 && statusId == 2 && userId) {
                if (oldAttendanceReport.type === 'PUNCHIN') {
                    await dbContext.Attendance.create({
                        userId,
                        punchinDate: oldAttendanceReport.createdAt,
                        punchinTime: oldAttendanceReport.createdAt.getTime(),
                        punchinNote: '',
                        punchinOffset: -420,
                        punchInImageUrl: oldAttendanceReport.imageUrl,
                        punchoutDate: null,
                        punchoutTime: null,
                        punchoutNote: null,
                        punchoutOffset: null,
                        punchOutImageUrl: null,
                    });
                }

                if (oldAttendanceReport.type === 'PUNCHOUT') {
                    var startDate = moment(oldAttendanceReport.createdAt).utc().startOf('day');
                    var endDate = moment(oldAttendanceReport.createdAt).utc().endOf('day');
                    await dbContext.Attendance.update({
                        punchoutDate: oldAttendanceReport.createdAt,
                        punchoutTime: oldAttendanceReport.createdAt.getTime(),
                        punchoutNote: '',
                        punchoutOffset: -420,
                        punchOutImageUrl: oldAttendanceReport.imageUrl,
                    }, {
                        where: {
                            punchoutDate: null,
                            punchoutTime: null,
                            punchinDate: {
                                [Op.between]: [startDate, endDate]
                            }
                        }
                    });
                }

            }
            // Send notification when approve or reject attendance report
            if(statusId != oldAttendanceReport.statusId && (statusId == leaveRequestStatus.APPROVED || statusId == leaveRequestStatus.REJECTED)) {
                const userModel = await dbContext.User.findOne({ where: { email: oldAttendanceReport.email } });
                if (userModel) {
                    sendNotification(
                        'Attendance report', `Your attendance report on at ${moment(oldAttendanceReport.createdAt).format('MMMM DD, YYYY HH:mm')} has been ${statusId == leaveRequestStatus.APPROVED ? 'approved' : 'rejected'}`,
                        '/admin/attendance-report',
                        NotificationType.ATTENDANCE_REPORT,
                        userModel.ownerId
                    );
                }
            }
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async deleteAttendanceReport(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            returnResult.result = false;
            const removeIds = req.body;
            if (removeIds?.length > 0) {
                const updatedRes = await dbContext.AttendanceReport.destroy({
                    where: {
                        attendanceReportId: removeIds
                    }
                });
                if (updatedRes) {
                    returnResult.result = true;
                }
            }
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async deleteAttendance(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            returnResult.result = false;
            const removeIds = req.body;
            if (removeIds?.length > 0) {
                const updatedRes = await dbContext.Attendance.destroy({
                    where: {
                        attendanceId: removeIds
                    }
                });
                if (updatedRes) {
                    returnResult.result = true;
                }
            }
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async getAttendanceRange(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const userId = req.query.userId;
            const timeZoneSetting = -req.query.timezone;
            const dataFilter = req.body;
            const result = await dbContext.Attendance.findAll({
                where: {
                    userId: userId,
                    [Op.and]: [
                        literal(`DATE_ADD('${dataFilter?.rangeDateValue?.startDate || dataFilter.startDate}', INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD(${'Attendance.punchinDate'}, INTERVAL ${timeZoneSetting} HOUR)`),
                        literal(`DATE_ADD(${'Attendance.punchinDate'}, INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD('${dataFilter?.rangeDateValue?.endDate || dataFilter.endDate}', INTERVAL ${timeZoneSetting} HOUR)`),
                    ],
                },
                attributes: [
                    'attendanceId',
                    'userId',
                    'punchinDate',
                    'punchinTime',
                    'punchinNote',
                    'punchinOffset',
                    'punchoutDate',
                    'punchoutTime',
                    'punchoutNote',
                    'punchoutOffset',
                    // 'punchInImageUrl', 
                    // 'punchOutImageUrl',
                    [
                        literal(
                            `CASE 
                              WHEN ${'Attendance.punchoutTime'} > ${'Attendance.punchinTime'} 
                                  THEN (${'Attendance.punchoutTime'} - ${'Attendance.punchinTime'}) / 3600000
                              ELSE 0
                          END`
                        ),
                        'duration',
                    ],
                ],
            });
            returnResult.result = result;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}
export default new attendanceController;