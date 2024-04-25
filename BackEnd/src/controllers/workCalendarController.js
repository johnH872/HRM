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
                    var lstWorkCalendar = [];

                    lstWorkCalendarsModel.forEach(item => {
                        var workCalendarItem = item?.dataValues;
                        if (workCalendarItem.User.userId === employee.userId &&
                            workCalendarItem.workingDate.getDate() === currentDate.getDate() &&
                            workCalendarItem.workingDate.getMonth() === currentDate.getMonth() &&
                            workCalendarItem.workingDate.getFullYear() === currentDate.getFullYear()) {
                                lstWorkCalendar.push(workCalendarItem);
                            }
                    });

                    dataOwner.workCalendarMonthly.push({
                        [key]: lstWorkCalendar
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