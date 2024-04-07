import { ReturnResult } from "../models/DTO/returnResult.js";
import { Op, literal, col } from 'sequelize';
import db from '../models/index.js'
import { Column, ReportScheduleDatum, ReportScheduleResult } from "../models/DTO/report-schedule.js";
import { leaveRequestStatus } from "../models/enums/leaveRequestStatus.js";
const dbContext = await db;

class ReportScheduleController {
    async getReportSchedule(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const dataFilterReport = req.body;
            const timeZoneSetting = 7;
            var reportDatas = [];
            var lstColumn = getAllColumnReport(dataFilterReport, timeZoneSetting);
            
            var queryEmployees = {
                
            };
            var queryAttendance = {
                [Op.and]: [
                    literal(`DATE_ADD('${dataFilterReport.fromDate}', INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD(${'Attendance.punchinDate'}, INTERVAL ${timeZoneSetting} HOUR)`),
                    literal(`DATE_ADD(${'Attendance.punchinDate'}, INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD('${dataFilterReport.toDate}', INTERVAL ${timeZoneSetting} HOUR)`),
                ],
            };
            var queryLeave = {
                status: leaveRequestStatus.APPROVED,
                [Op.or]: [
                    {
                        [Op.and]: [
                            literal(`DATE_ADD('${dataFilterReport.fromDate}', INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD(${'LeaveRequest.leaveDateFrom'}, INTERVAL ${timeZoneSetting} HOUR)`),
                            literal(`DATE_ADD(${'LeaveRequest.leaveDateFrom'}, INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD('${dataFilterReport.toDate}', INTERVAL ${timeZoneSetting} HOUR)`),
                        ],
                    },
                    {
                        [Op.and]: [
                            literal(`DATE_ADD('${dataFilterReport.fromDate}', INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD(${'LeaveRequest.leaveDateTo'}, INTERVAL ${timeZoneSetting} HOUR)`),
                            literal(`DATE_ADD(${'LeaveRequest.leaveDateTo'}, INTERVAL ${timeZoneSetting} HOUR) <= DATE_ADD('${dataFilterReport.toDate}', INTERVAL ${timeZoneSetting} HOUR)`),
                        ],
                    }
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
                queryAttendance.userId = {
                    [Op.in]: lstUserHasRole
                };
                queryLeave.userId = {
                    [Op.in]: lstUserHasRole
                };
            } else if (dataFilterReport.listProfile && dataFilterReport.listProfile.length > 0) {
                queryEmployees.userId = {
                    [Op.in]: dataFilterReport.listProfile
                };
                queryAttendance.userId = {
                    [Op.in]: dataFilterReport.listProfile
                };
                queryLeave.userId = {
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
                queryAttendance.userId = {
                    [Op.in]: lstUserHasRole
                };
                queryLeave.userId = {
                    [Op.in]: lstUserHasRole
                };
            }

            if (dataFilterReport.listStatusLeave && dataFilterReport.listStatusLeave.length > 0) {
                if (dataFilterReport.listStatusLeave.includes('noPaid') && dataFilterReport.listStatusLeave.includes('paid')) {
                    queryLeave = queryLeave;
                } else if (dataFilterReport.listStatusLeave.includes('paid')) {
                    queryLeave['$LeaveType.isPaidSalary$'] = true;
                } else if (dataFilterReport.listStatusLeave.includes('noPaid')) {
                    queryLeave['$LeaveType.isPaidSalary$'] = false;
                }
            } else {
                queryLeave['$LeaveType.isPaidSalary$'] = {
                    [Op.or]: [true, false],
                };
            }

            const lstEmployeesModel = await dbContext.User.findAll({
                where: queryEmployees,
                order: [
                    [literal("CONCAT(firstName, ' ', COALESCE(middleName, ''), ' ', lastName)")]
                ]
            });

            const lstAttendancesModel = await dbContext.Attendance.findAll({
                where: queryAttendance,
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
                ],
                attributes: [
                    'attendanceId',
                    'userId',
                    [
                        literal(`DATE_ADD(${'Attendance.punchinDate'}, INTERVAL ${timeZoneSetting} HOUR)`),
                        'punchinDate'
                    ],
                    'punchinNote',
                    'punchinOffset',
                    [
                        literal(`DATE_ADD(${'Attendance.punchoutDate'}, INTERVAL ${timeZoneSetting} HOUR)`),
                        'punchoutDate'
                    ],
                    'punchoutNote',
                    'punchoutOffset',
                    [
                      literal(
                        `CASE 
                            WHEN ${'Attendance.punchoutTime'} > ${'Attendance.punchinTime'} 
                                THEN ${'Attendance.punchoutTime'} - ${'Attendance.punchinTime'} / 3600000
                            ELSE 0
                        END`
                      ),
                      'duration',
                    ],
                ],                
            });

            const lstLeavesModel = await dbContext.LeaveRequest.findAll({
                where: queryLeave,
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
                        model: dbContext.LeaveEntitlement,
                        attributes: [
                            'leaveEntitlementId',
                            'userId',
                            'leaveTypeId',
                            'startDate',
                            'endDate',
                            'availableLeave',
                            'usableLeave',
                            'usedLeave',
                            'effectedYear'
                        ],
                        include: [
                            {
                                model: dbContext.LeaveType,
                                attributes: [
                                    'leaveTypeId',
                                    'leaveTypeName',
                                    'defaultStartDay',
                                    'defaultStartMonth',
                                    'defaultEndDay',
                                    'defaultEndMonth',
                                    'defaultBudget',
                                    'isPaidSalary',
                                ],
                            },
                        ],
                    },
                ],
                attributes: [
                    'leaveRequestId',
                    'userId',
                    'leaveEntitlementId',
                    [
                        literal(`DATE_ADD(LeaveRequest.leaveDateFrom, INTERVAL ${timeZoneSetting} HOUR)`),
                        'leaveDateFrom'
                    ],
                    [
                        literal(`DATE_ADD(LeaveRequest.leaveDateTo, INTERVAL ${timeZoneSetting} HOUR)`),
                        'leaveDateTo'
                    ],
                    'session',
                    'numberOfHour',
                    'status',
                    'note',
                    'reason',
                ]
            });

            lstEmployeesModel.forEach(employee => {
                var dataOwner = new ReportScheduleDatum();
                dataOwner.userName = employee?.firstName + ' ' + employee?.middleName + ' ' + employee?.lastName;
                dataOwner.userId = employee?.userId;
                dataOwner.attendanceMonthly = [];
                dataOwner.attendanceDetailMonthly = [];
                dataOwner.leaveRequestMonthly = [];
                dataOwner.leaveRequestTypeMonthly = [];
                var startDate = new Date(dataFilterReport.fromDate);
                startDate.setHours(startDate.getHours() + timeZoneSetting);
                var endDate = new Date(dataFilterReport.toDate);
                endDate.setHours(endDate.getHours() + timeZoneSetting);
                var currentDate = startDate;
                var totalDurationInRange = 0;
                var totalDayWorkingInRange = 0;
                while (currentDate.getTime() <= endDate.getTime()) {
                    const key = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
                    var lstAttendanceDetail = [];
                    var totalDurationInDay = 0;

                    var firstAttendanceInDay = lstAttendancesModel.find(attendance => 
                        attendance.userId = employee.userId &&
                        attendance.punchinDate.getDate() === currentDate.getDate() &&
                        attendance.punchinDate.getMonth() === currentDate.getMonth() &&
                        attendance.punchinDate.getFullYear() === currentDate.getFullYear());
                    var indexLastAttendanceInDay = lstAttendancesModel.findLastIndex(attendance => 
                        attendance.userId = employee.userId &&
                        attendance.punchinDate.getDate() === currentDate.getDate() &&
                        attendance.punchinDate.getMonth() === currentDate.getMonth() &&
                        attendance.punchinDate.getFullYear() === currentDate.getFullYear());
                    var lastAttendanceInDate = lstAttendancesModel[indexLastAttendanceInDay];

                    lstAttendancesModel.forEach(item => {
                        if (item.userId === employee.userId &&
                            item.punchinDate.getDate() === currentDate.getDate() &&
                            item.punchinDate.getMonth() === currentDate.getMonth() &&
                            item.punchinDate.getFullYear() === currentDate.getFullYear()) {
                                totalDurationInDay += item.duration;
                                lstAttendanceDetail.push({
                                    attendanceId: item.attendanceId,
                                    userId: item.userId,
                                    User: item.User,
                                    punchinDate: item.punchinDate ? item.punchinDate.setHours(item.punchinDate.getHours() - timeZoneSetting) : item.punchinDate,
                                    punchoutDate: item.punchoutDate ? item.punchoutDate.setHours(item.punchoutDate.getHours() - timeZoneSetting) : item.punchoutDate,
                                    duration: item.duration,
                                });
                            }
                    });

                    var firstLeaveInDate = lstLeavesModel.find(leave => 
                        leave.userId === employee.userId && 
                        leave.leaveDateFrom.getDate() === currentDate.getDate());
                    var indexLastLeaveInDate = lstLeavesModel.findLastIndex(leave => 
                        leave.userId === employee.userId && 
                        leave.leaveDateFrom.getDate() === currentDate.getDate());
                    var lastLeaveInDate = lstLeavesModel[indexLastLeaveInDate];
                    var totalNumberOfHourInDay = lstAttendancesModel.reduce((acc, leave) => acc + leave?.numberOfHour, 0);
                    lstLeavesModel.forEach(item => {
                        if (item.userId === employee.userId &&
                            item.leaveDateFrom.getDate() === currentDate.getDate()) {
                            lstAttendanceDetail.push({
                                leaveRequestId: item.leaveRequestId,
                                userId: item.userId,
                                User: item.User,
                                reason: item.reason,
                                leaveEntitlementId: item.leaveEntitlementId,
                                LeaveEntitlement: item.LeaveEntitlement,
                                leaveDateFrom: item.leaveDateFrom ? item.leaveDateFrom.setHours(item.leaveDateFrom.getHours() - timeZoneSetting) : item.leaveDateFrom,
                                leaveDateTo: item.leaveDateTo ? item.leaveDateTo.setHours(item.leaveDateTo.getHours() - timeZoneSetting) : item.leaveDateTo,
                                numberOfHour: item.numberOfHour,
                                status: item.status,
                                session: item.session,
                                note: item.note,
                            });
                        }
                    });

                    switch (dataFilterReport.timeMode) {
                        case 'Day':
                        case 'Week':
                            if (firstLeaveInDate != null && lastLeaveInDate != null && totalNumberOfHourInDay > 0) {
                                dataOwner.leaveRequestMonthly.push({
                                    key: key + '-leave',
                                    value: `${firstLeaveInDate.leaveDateFrom.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
                                            ${lastLeaveInDate.leaveDateTo.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} 
                                            (${totalNumberOfHourInDay}h)`
                                });
                                dataOwner.leaveRequestTypeMonthly.push({
                                    key: key + '-leaveType',
                                    value: firstLeaveInDate.LeaveEntitlement.LeaveType.isPaidSalary ? 'Paid' : 'NoPaid'
                                });
                            } else {
                                dataOwner.leaveRequestMonthly.push({
                                    key: key + '-leave',
                                    value: null
                                });
                                dataOwner.leaveRequestTypeMonthly.push({
                                    key: key + '-leaveType',
                                    value: null
                                });
                            }
                            if (dataFilterReport.listStatus.includes('red') && 0 < totalDurationInDay && totalDurationInDay < 9.00) {
                                if (firstAttendanceInDay != null && lastAttendanceInDate != null) {
                                    dataOwner.attendanceMonthly.push({
                                        key: key,
                                        value: `${firstAttendanceInDay.punchinDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
                                                ${lastAttendanceInDate.punchoutDate ? lastAttendanceInDate.punchoutDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '??:??'} = 
                                                ${totalDurationInDay}h`
                                    });
                                    totalDurationInRange += totalDurationInDay;
                                } else {
                                    dataOwner.attendanceMonthly.push({
                                        key: key,
                                        value: `--`
                                    });
                                }
                            }
                            if (dataFilterReport.listStatus.includes('yellow')) {
                                if (firstAttendanceInDay != null && lastAttendanceInDate != null) {
                                    if (!lastAttendanceInDate.punchoutDate) {
                                        dataOwner.attendanceMonthly.push({
                                            key: key,
                                            value: `${firstAttendanceInDay.punchinDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
                                                    ${lastAttendanceInDate.punchoutDate ? lastAttendanceInDate.punchoutDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '??:??'} = 
                                                    ${totalDurationInDay}h`
                                        });
                                        totalDurationInRange += totalDurationInDay;
                                    }
                                } else {
                                    dataOwner.attendanceMonthly.push({
                                        key: key,
                                        value: `--`
                                    });
                                }
                            }
                            if (dataFilterReport.listStatus.includes('green') && 9.00 <= totalDurationInDay && totalDurationInDay < 10.00) {
                                if (firstAttendanceInDay != null && lastAttendanceInDate != null) {
                                    dataOwner.attendanceMonthly.push({
                                        key: key,
                                        value: `${firstAttendanceInDay.punchinDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
                                                ${lastAttendanceInDate.punchoutDate ? lastAttendanceInDate.punchoutDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '??:??'} = 
                                                ${totalDurationInDay}h`
                                    });
                                    totalDurationInRange += totalDurationInDay;
                                } else {
                                    dataOwner.attendanceMonthly.push({
                                        key: key,
                                        value: `--`
                                    });
                                }
                            }
                            if (dataFilterReport.listStatus.includes('purple') && totalDurationInDay >= 10.00) {
                                if (firstAttendanceInDay != null && lastAttendanceInDate != null) {
                                    dataOwner.attendanceMonthly.push({
                                        key: key,
                                        value: `${firstAttendanceInDay.punchinDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
                                                ${lastAttendanceInDate.punchoutDate ? lastAttendanceInDate.punchoutDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '??:??'} = 
                                                ${totalDurationInDay}h`
                                    });
                                    totalDurationInRange += totalDurationInDay;
                                } else {
                                    dataOwner.attendanceMonthly.push({
                                        key: key,
                                        value: `--`
                                    });
                                }
                            }
                            break;
                        case 'Month':
                            if (firstLeaveInDate != null && lastLeaveInDate != null && totalNumberOfHourInDay > 0) {
                                dataOwner.leaveRequestMonthly.push({
                                    key: key + '-leave',
                                    value: `${firstLeaveInDate.leaveDateFrom.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
                                            ${lastLeaveInDate.leaveDateTo.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} 
                                            (${totalNumberOfHourInDay}h)`
                                });
                                dataOwner.leaveRequestTypeMonthly.push({
                                    key: key + '-leaveType',
                                    value: firstLeaveInDate.LeaveEntitlement.LeaveType.isPaidSalary ? 'Paid' : 'NoPaid'
                                });
                            } else {
                                dataOwner.leaveRequestMonthly.push({
                                    key: key + '-leave',
                                    value: null
                                });
                                dataOwner.leaveRequestTypeMonthly.push({
                                    key: key + '-leaveType',
                                    value: null
                                });
                            }
                            if (dataFilterReport.listStatus.includes('yellow')) {
                                dataOwner.attendanceMonthly.push({
                                    key: key,
                                    value: null
                                });
                            }
                            if (dataFilterReport.listStatus.includes('red') && 0 < totalDurationInDay && totalDurationInDay < 9.00) {
                                dataOwner.attendanceMonthly.push({
                                    key: key,
                                    value: `${totalDurationInDay}`
                                });
                                totalDayWorkingInRange += totalDurationInDay;
                            }
                            if (dataFilterReport.listStatus.includes('green') && 9.00 <= totalDurationInDay && totalDurationInDay < 10.00) {
                                dataOwner.attendanceMonthly.push({
                                    key: key,
                                    value: `${totalDurationInDay}`
                                });
                                totalDayWorkingInRange += totalDurationInDay;
                            }
                            if (dataFilterReport.listStatus.includes('purple') && totalDurationInDay >= 10.00) {
                                dataOwner.attendanceMonthly.push({
                                    key: key,
                                    value: `${totalDurationInDay}`
                                });
                                totalDayWorkingInRange += totalDurationInDay;
                            }
                            break;
                    }

                    dataOwner.attendanceDetailMonthly.push({
                        key: key + '-detail',
                        value: lstAttendanceDetail
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                dataOwner.grandTotal = totalDayWorkingInRange;
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
                    value: `${currentDate.toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 2)}, ${currentDate.getMonth() + 1}/${currentDate.getDate()}`
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

export default new ReportScheduleController;