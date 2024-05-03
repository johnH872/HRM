import { ReturnResult } from "../models/DTO/returnResult.js";
import { Op, literal, col } from 'sequelize';
import db from '../models/index.js'
import { Column, ReportScheduleDatum, ReportScheduleResult, WorkCalendarDatum } from "../models/DTO/report-schedule.js";
import { leaveRequestStatus } from "../models/enums/leaveRequestStatus.js";
import { format } from 'date-fns';

const dbContext = await db;

class WorkCalendarController {
    async getWorkCalendar(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const dataFilterReport = req.body;
            const timeZoneSetting = 7;
            var reportDatas = [];
            var lstColumn = getAllColumnReport(dataFilterReport, timeZoneSetting);
            
            var queryEmployees = {
                
            };
            var queryWorkCalendar = {
                [Op.and]: [
                    literal(`DATE_ADD('${dataFilterReport.fromDate}', INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD(${'WorkCalendar.workingDate'}, INTERVAL ${timeZoneSetting} HOUR)`),
                    literal(`DATE_ADD(${'WorkCalendar.workingDate'}, INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD('${dataFilterReport.toDate}', INTERVAL ${timeZoneSetting} HOUR)`),
                ],
            };

            if (dataFilterReport.listProfile && dataFilterReport.listProfile.length > 0 && dataFilterReport.listRoles && dataFilterReport.listRoles.length > 0) {
                var lstUserHasRole = dbContext.User_Role.findAll({
                    where: {
                        roleId: {
                            [Op.in]: dataFilterReport.listRoles,
                        }
                    },
                    attributes: [
                        'userId'
                    ]
                });
                lstUserHasRole = lstUserHasRole.concat(dataFilterReport.listProfile);
                queryEmployees.userId = {
                    [Op.in]: lstUserHasRole
                };
                queryWorkCalendar.userId = {
                    [Op.in]: lstUserHasRole
                };
            } else if (dataFilterReport.listProfile && dataFilterReport.listProfile.length > 0) {
                queryEmployees.userId = {
                    [Op.in]: dataFilterReport.listProfile
                };
                queryWorkCalendar.userId = {
                    [Op.in]: dataFilterReport.listProfile
                };
            } else if (dataFilterReport.listRoles && dataFilterReport.listRoles.length > 0) {
                var lstUserHasRole = dbContext.User_Role.findAll({
                    where: {
                        roleId: {
                            [Op.in]: dataFilterReport.listRoles,
                        }
                    },
                    attributes: [
                        'userId'
                    ]
                });
                queryEmployees.userId = {
                    [Op.in]: lstUserHasRole
                };
                queryWorkCalendar.userId = {
                    [Op.in]: lstUserHasRole
                };
            }

            const lstEmployeesModel = await dbContext.User.findAll({
                where: queryEmployees,
                order: [
                    [literal("CONCAT(firstName, ' ', COALESCE(middleName, ''), ' ', lastName)")]
                ]
            });

            const lstWorkCalendarsModel = await dbContext.WorkCalendar.findAll({
                where: queryWorkCalendar,
                include: [
                    {
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
                    {
                        model: dbContext.WorkCalendarDetail
                    }
                ],
                attributes: [
                    'workCalendarId',
                    'userId',
                    'workingDate',
                    'workingType',
                    'workingHour',
                ],                
            });

            lstEmployeesModel.forEach(employee => {
                var dataOwner = new WorkCalendarDatum();
                dataOwner.userName = employee?.firstName + ' ' + employee?.middleName + ' ' + employee?.lastName;
                dataOwner.userId = employee?.userId;
                dataOwner.workCalendarMonthly = [];
                var startDate = new Date(dataFilterReport.fromDate);
                startDate.setHours(startDate.getHours() + timeZoneSetting);
                var endDate = new Date(dataFilterReport.toDate);
                endDate.setHours(endDate.getHours() + timeZoneSetting);
                var currentDate = startDate;
                while (currentDate.getTime() <= endDate.getTime()) {
                    const key = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;

                    lstWorkCalendarsModel.forEach(item => {
                        var workCalendarItem = item?.dataValues;
                        if (workCalendarItem.User.userId === employee.userId &&
                            workCalendarItem.workingDate.getDate() === currentDate.getDate() &&
                            workCalendarItem.workingDate.getMonth() === currentDate.getMonth() &&
                            workCalendarItem.workingDate.getFullYear() === currentDate.getFullYear()) {
                                dataOwner.workCalendarMonthly.push({
                                    [key]: workCalendarItem
                                });
                            }
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                reportDatas.push(dataOwner);
            });
            returnResult.result = {
                data: reportDatas,
                column: lstColumn,
            };
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveWorkCalendar(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.workCalendarId === null || model.workCalendarId === 0) { // Add new
                const saveWorkCalendar = await dbContext.WorkCalendar.create({
                    userId: model.userId,
                    workingType: model.workingType,
                    workingHour: model.workingHour,
                    workingDate: model.workingDate
                });
                if (saveWorkCalendar) {
                    result.result = saveWorkCalendar;
                } else {
                    result.message = "Cannot save work calendar";
                }
            } else { // Edit
                // Find existing WorkCalendar
                const existWorkCalendar = await dbContext.WorkCalendar.findOne({
                    where: {
                        workCalendarId: model.workCalendarId
                    }
                });
                if (existWorkCalendar) {
                    const saveWorkCalendar = await dbContext.WorkCalendar.update({
                        userId: model.userId ?? existWorkCalendar.userId,
                        workingType: model.workingType ?? existWorkCalendar.workingType,
                        workingHour: model.workingHour ?? existWorkCalendar.workingHour,
                        workingDate: model.workingDate ?? existWorkCalendar.workingDate
                    }, {
                        where: {
                            workCalendarId: model.workCalendarId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveWorkCalendar) {
                        result.result = await dbContext.WorkCalendar.findOne({
                            where: {
                                workCalendarId: model.workCalendarId
                            }
                        });
                    } else {
                        result.message = 'Can not save WorkCalendar';
                    }
                } else {
                    result.message = 'WorkCalendar not found';
                }
            }
            return res.status(200).json(result);
        } catch(error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

    async saveWorkCalendarDetail(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.workCalendarDetailId === null || model.workCalendarDetailId === 0) { // Add new
                const saveWorkCalendarDetail = await dbContext.WorkCalendarDetail.create({
                    workCalendarId: model.workCalendarId,
                    from: model.from,
                    to: model.to,
                    description: model.description,
                    codeColor: model.codeColor
                });
                if (saveWorkCalendarDetail) {
                    result.result = saveWorkCalendarDetail;
                } else {
                    result.message = "Cannot save work calendar detail";
                }
            } else { // Edit
                // Find existing WorkCalendarDetail
                const existWorkCalendarDetail = await dbContext.WorkCalendarDetail.findOne({
                    where: {
                        workCalendarDetailId: model.workCalendarDetailId
                    }
                });
                if (existWorkCalendarDetail) {
                    const saveWorkCalendarDetail = await dbContext.WorkCalendarDetail.update({
                        workCalendarId: model.workCalendarId ?? existWorkCalendarDetail.workCalendarId,
                        from: model.from ?? existWorkCalendarDetail.from,
                        to: model.to ?? existWorkCalendarDetail.to,
                        description: model.description ?? existWorkCalendarDetail.description,
                        codeColor: model.codeColor  ?? existWorkCalendarDetail.codeColor
                    }, {
                        where: {
                            workCalendarDetailId: model.workCalendarDetailId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveWorkCalendarDetail) {
                        result.result = await dbContext.WorkCalendarDetail.findOne({
                            where: {
                                workCalendarDetailId: model.workCalendarDetailId
                            }
                        });
                    } else {
                        result.message = 'Can not save Work Calendar Detail';
                    }
                } else {
                    result.message = 'Work Calendar Detail not found';
                }
            }
            return res.status(200).json(result);
        } catch(error) {
            res.status(400).json(error);
            console.log(error);
        }
    }
}

function getAllColumnReport(dataFilterReport, timeZoneSetting) {
    var result = [];
    var column = new Column();
    column.month = [];
    var startDate = new Date(dataFilterReport.fromDate);
    startDate.setHours(startDate.getHours() + timeZoneSetting);
    var endDate = new Date(dataFilterReport.toDate);
    endDate.setHours(endDate.getHours() + timeZoneSetting);
    var currentDate = startDate;
    while (currentDate.getTime() <= endDate.getTime()) {
        switch (dataFilterReport.timeMode) {
            case 'Month':
                column?.month?.push({
                    key: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
                    value: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`
                });
                break;
            case 'Week':
            case 'Day':
                column?.month?.push({
                    key: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
                    value: `${currentDate.toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)}, ${currentDate.toLocaleString('en-US', { month: 'short' })} ${currentDate.getDate()}`
                });
                break;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    result.push(column);
    return result;
}

export default new WorkCalendarController;