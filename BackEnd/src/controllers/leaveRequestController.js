import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
import { leaveRequestStatus } from '../models/enums/leaveRequestStatus.js';
const dbContext = await db;
import moment from "moment/moment.js";
import { Op, where, literal } from "sequelize";
import { sendNotification } from "../utils/notification.js";
import { NotificationType } from "../models/enums/notificationType.js";

class LeaveRequestController {
    async getAllLeaveRequest(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const leaveRequestPaging = await dbContext.LeaveRequest.findAll({
                include: [
                    {
                        model: dbContext.User,
                    },
                    {
                        model: dbContext.LeaveEntitlement,
                        include: [
                            {
                                model: dbContext.LeaveType,
                            },
                        ],
                    },
                ],
                order: [
                    ['status', 'ASC']
                ]
            });
            returnResult.result = leaveRequestPaging;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveLeaveRequest(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            var leaveDateFrom = new Date(model?.leaveDateFrom);
            var leaveDateTo = new Date(model?.leaveDateTo);
            model.numberOfHour = await calculateWorkingHour(leaveDateFrom, leaveDateTo);
            if (model.leaveRequestId === null || model.leaveRequestId === 0) { // Add new
                model.status = leaveRequestStatus.WAITING;
                const saveLeaveRequest = await dbContext.LeaveRequest.create({
                    userId: model.userId,
                    leaveEntitlementId: model.leaveEntitlementId,
                    leaveDateFrom: model.leaveDateFrom,
                    leaveDateTo: model.leaveDateTo,
                    session: model.session,
                    numberOfHour: model.numberOfHour,
                    status: model.status,
                    note: model.note,
                    reason: model.reason,
                    reasonRejected: model.reasonRejected
                });
                if (saveLeaveRequest) {
                    result.result = saveLeaveRequest;
                    await handleLeaveEntitlementForLeaveRequest(saveLeaveRequest.userId, saveLeaveRequest.leaveEntitlementId);
                    const userModel = await dbContext.User.findByPk(model.userId);
                    if (model.userId === model.userAction) {
                        if(userModel) {
                            sendNotification(
                                'Leave request', `${userModel?.firstName || ''} ${userModel?.middleName || ''} ${userModel?.lastName || ''} submitted a leave request.`,
                                '/admin/leave-request',
                                NotificationType.LEAVE_REQUEST,
                                userModel.ownerId
                            );
                        }
                    } else {
                        const ownerModel = await dbContext.User.findByPk(userModel.ownerId);
                        if(ownerModel) {
                            sendNotification(
                                'Leave request', `${ownerModel?.firstName || ''} ${ownerModel?.middleName || ''} ${ownerModel?.lastName || ''} assigned a leave request for you.`,
                                '/admin/leave-request',
                                NotificationType.LEAVE_REQUEST,
                                userModel.userId
                            );
                        }
                    }
                    
                } else {
                    result.message = "Cannot save leave request";
                }
            } else { // Edit
                // Find existing leave Request
                const existLeaveRequest = await dbContext.LeaveRequest.findOne({
                    where: {
                        leaveRequestId: model.leaveRequestId
                    }
                });
                if (existLeaveRequest) {
                    const saveLeaveRequest = await dbContext.LeaveRequest.update({
                        userId: model.userId ?? existLeaveRequest.userId,
                        leaveEntitlementId: model.leaveEntitlementId ?? existLeaveRequest.leaveEntitlementId,
                        leaveDateFrom: model.leaveDateFrom ?? existLeaveRequest.leaveDateFrom,
                        leaveDateTo: model.leaveDateTo ?? existLeaveRequest.leaveDateTo,
                        session: model.session ?? existLeaveRequest.session,
                        numberOfHour: model.numberOfHour ?? existLeaveRequest.numberOfHour,
                        status: model.status ?? existLeaveRequest.status,
                        note: model.note ?? existLeaveRequest.note,
                        reason: model.reason ?? existLeaveRequest.reason,
                        reasonRejected: model.reasonRejected ?? existLeaveRequest.reasonRejected
                    }, {
                        where: {
                            leaveRequestId: model.leaveRequestId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveLeaveRequest) {
                        result.result = await dbContext.LeaveRequest.findOne({
                            where: {
                                leaveRequestId: model.leaveRequestId
                            }
                        });
                        handleLeaveEntitlementForLeaveRequest(result?.result?.userId, result?.result?.leaveEntitlementId);
                        if(existLeaveRequest.status != model.status && (model.status == leaveRequestStatus.REJECTED || model.status == leaveRequestStatus.APPROVED)) {
                            sendNotification(
                                'Leave request', `Leave on ${moment(model.leaveDateFrom).format('MMMM DD, YYYY')} has been ${model.status == leaveRequestStatus.APPROVED ? 'approved' : 'rejected'}.`,
                                '/admin/leave-request',
                                NotificationType.LEAVE_REQUEST,
                                model.userId
                            );
                        }

                        // handle working hours of work calendar
                        if (model.status === leaveRequestStatus.APPROVED) {
                            var startDate = new Date(result.result.leaveDateFrom);
                            var endDate = new Date(result.result.leaveDateTo);
                            var currentDate = startDate;
                            while (currentDate.getTime() < endDate.getTime()) {
                                const numberOfHours = await calculateWorkingHour(currentDate, endDate);
                                if (numberOfHours > 8) {
                                    const swappedDate = new Date(currentDate);
                                    swappedDate.setHours(17);
                                    swappedDate.setMinutes(30);
                                    numberOfHours = await calculateWorkingHour(currentDate, swappedDate);
                                }
                                currentDate.setHours(0);
                                var queryWorkCalendar = {
                                    [Op.and]: [
                                        literal(`DATE('${currentDate.toISOString()}') = DATE(${'WorkCalendar.workingDate'})`),
                                        literal(`${'WorkCalendar.userId'} = '${result.result.userId}'`),
                                    ],
                                };
                                var existingWorkCalendar = await dbContext.WorkCalendar.findOne({
                                    where: queryWorkCalendar
                                });
                                existingWorkCalendar = existingWorkCalendar.dataValues;
                                if (existingWorkCalendar) {
                                    await dbContext.WorkCalendar.update({
                                        workingHour: existingWorkCalendar.workingHour - numberOfHours
                                    }, {
                                        where: {
                                            workCalendarId: existingWorkCalendar.workCalendarId
                                        }
                                    });
                                }
                                currentDate.setDate(currentDate.getDate() + 1);
                                currentDate.setHours(8);
                                currentDate.setMinutes(30);
                            }
                        }
                    } else {
                        result.message = 'Can not save Leave Request';
                    }
                } else {
                    result.message = 'Leave Request not found';
                }
            }
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

    async getLeaveRequestByEmployeeId(req, res, next) {
        var result = new ReturnResult;
        try {
            var employeeId = req.params.id;
            const lstRequest = await dbContext.LeaveRequest.findAll({
                // include: [
                //     {
                //         model: dbContext.LeaveType,
                //     },
                // ],
                where: {
                    userId: employeeId,
                }
            });
            if (lstRequest) result.result = lstRequest;
            else result.message = "Employee not have any Leave Request";
        } catch (error) {
            console.error(error);
        }
        return res.status(200).json(result);
    }

    async getLeaveRequestByFilter(req, res, next) {
        var result = new ReturnResult;
        try {
            var employeeId = req.params.id;
            var { start, end } = req.body;
            const lstRequest = await dbContext.LeaveRequest.findAll({
                include: [
                    {
                        model: dbContext.DataState,
                    },
                ],
                where: {
                    userId: employeeId,
                    leaveDateFrom: {
                        [Op.between]: [new Date(start), new Date(end)]
                    },
                    // leaveDateTo: {
                    //     [Op.lte]: new Date(end)
                    // }
                }
            });
            if (lstRequest) result.result = lstRequest;
            else result.message = "Employee not have any Leave Request";
        } catch (error) {
            console.error(error);
        }
        return res.status(200).json(result);
    }
}

async function handleLeaveEntitlementForLeaveRequest(userId, leaveEntitlementId) {
    const totalNumberOfHoursUsed = await dbContext.LeaveRequest.sum('numberOfHour', {
        where: {
            userId: userId,
            leaveEntitlementId: leaveEntitlementId,
            status: leaveRequestStatus.APPROVED,
        }
    });

    const existLeaveEntitlement = await dbContext.LeaveEntitlement.findOne({
        where: {
            leaveEntitlementId: leaveEntitlementId
        }
    });
    if (existLeaveEntitlement) {
        existLeaveEntitlement.usedLeave = totalNumberOfHoursUsed / 8;
        await dbContext.LeaveEntitlement.update({
            usedLeave: totalNumberOfHoursUsed / 8
        }, {
            where: {
                leaveEntitlementId: existLeaveEntitlement.leaveEntitlementId
            },
            returning: true,
            plain: true
        });
    }
}

async function calculateWorkingHour(startDate, endDate, timeZone = 7) {
    let workingHour = 0;
    try {
        if (startDate && endDate) {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            startDate.setHours(startDate.getHours() + timeZone);
            endDate.setHours(endDate.getHours() + timeZone);

            var lstWorkingTimeSettings = await dbContext.Setting.findAll({
                where: {
                    group: 'WORKING_TIME'
                }
            });
            var morningStart = lstWorkingTimeSettings?.find(item => item.key === 'MORNING_START')?.value?.split(':');
            var morningEnd = lstWorkingTimeSettings?.find(item => item.key === 'MORNING_END')?.value?.split(':');
            var afternoonStart = lstWorkingTimeSettings?.find(item => item.key === 'AFTERNOON_START')?.value?.split(':');
            var afternoonEnd = lstWorkingTimeSettings?.find(item => item.key === 'AFTERNOON_END')?.value?.split(':');
            while (startDate.getTime() <= endDate.getTime()) {
                // Check is not Saturday or Sunday
                if (startDate.getDay() === 6 || startDate.getDay() === 0) {
                    startDate.setDate(startDate.getDate() + 1);
                    startDate.setHours(Number(morningStart[0]) ?? 8);
                    startDate.setMinutes(Number(morningStart[1]) ?? 30);
                    continue;
                }

                let estEndDate = new Date(startDate);
                estEndDate.setDate(estEndDate.getDate() + 1);
                estEndDate.setHours(0);
                estEndDate.setMinutes(30);

                if (endDate.getTime() <= estEndDate.getTime()) estEndDate = endDate;
                workingHour += await calculateWorkingHourInDay(startDate, estEndDate);
                startDate.setDate(startDate.getDate() + 1);
                startDate.setHours(Number(morningStart[0]) ?? 8);
                startDate.setMinutes(Number(morningStart[1]) ?? 30);
            }
        }
    } catch (ex) {
        console.error(ex);
    }
    return Math.round(workingHour);
}

async function calculateWorkingHourInDay(startDate, endDate, timeZoneSetting = 7) {
    let workingHour = 0;
    try {
        var lstWorkingTimeSettings = await dbContext.Setting.findAll({
            where: {
                group: 'WORKING_TIME'
            }
        });
        var morningStart = lstWorkingTimeSettings?.find(item => item.key === 'MORNING_START')?.value?.split(':');
        var morningEnd = lstWorkingTimeSettings?.find(item => item.key === 'MORNING_END')?.value?.split(':');
        var afternoonStart = lstWorkingTimeSettings?.find(item => item.key === 'AFTERNOON_START')?.value?.split(':');
        var afternoonEnd = lstWorkingTimeSettings?.find(item => item.key === 'AFTERNOON_END')?.value?.split(':');
        if (startDate.getUTCDate() === endDate.getUTCDate()) {
            var morningStartTime = new Date(startDate);
            morningStartTime.setHours((Number(morningStart[0]) ?? 8) + timeZoneSetting);
            morningStartTime.setMinutes(Number(morningStart[1]) ?? 30);
            var morningEndTime = new Date(startDate);
            morningEndTime.setHours((Number(morningEnd[0]) ?? 12) + timeZoneSetting);
            morningEndTime.setMinutes(Number(morningEnd[1]) ?? 0);
            const morningWorkingHours = getOverlapDuration(morningStartTime, morningEndTime, startDate, endDate);
            var afternoonStartTime = new Date(startDate);
            afternoonStartTime.setHours((Number(afternoonStart[0]) ?? 13) + timeZoneSetting);
            afternoonStartTime.setMinutes(Number(afternoonStart[1]) ?? 0);
            var afternoonEndTime = new Date(startDate);
            afternoonEndTime.setHours((Number(afternoonEnd[0]) ?? 17) + timeZoneSetting);
            afternoonEndTime.setMinutes(Number(afternoonEnd[1]) ?? 30);
            const afternoonWorkingHours = getOverlapDuration(afternoonStartTime, afternoonEndTime, startDate, endDate);
            const totalWorkingHours = morningWorkingHours + afternoonWorkingHours;
            workingHour = totalWorkingHours;
        }
    } catch (ex) {
        console.error(ex);
    }
    return workingHour;
}

function getOverlapDuration(defaultStartDate, defaultEndDate, inputStartDate, inputEndDate) {
    if (!overlaps(defaultStartDate, defaultEndDate, inputStartDate, inputEndDate))
        return 0;
    let overlapStart = inputStartDate.getTime() > defaultStartDate.getTime() ? inputStartDate : defaultStartDate;
    let overlapEnd = inputEndDate.getTime() < defaultEndDate.getTime() ? inputEndDate : defaultEndDate;

    return (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
}

function overlaps(defaultStartDate, defaultEndDate, inputStartDate, inputEndDate) {
    return inputStartDate.getTime() < defaultEndDate.getTime() && defaultStartDate.getTime() < inputEndDate.getTime();
}

export default new LeaveRequestController;