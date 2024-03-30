import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
import { leaveRequestStatus } from '../models/enums/leaveRequestStatus.js';
const dbContext = await db;
import moment from "moment/moment.js";

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
        } catch(error) {
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
            model.numberOfHour = calculateWorkingHour(leaveDateFrom, leaveDateTo);
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
                    reason: model.reason
                });
                if (saveLeaveRequest) {
                    result.result = saveLeaveRequest;
                    await handleLeaveEntitlementForLeaveRequest(saveLeaveRequest.userId, saveLeaveRequest.leaveEntitlementId);
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
                        reason: model.reason ?? existLeaveRequest.reason
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
                        await handleLeaveEntitlementForLeaveRequest(result?.result?.userId, result?.result?.leaveEntitlementId);
                    } else {
                        result.message = 'Can not save Leave Request';
                    }
                } else {
                    result.message = 'Leave Request not found';
                }
            }
            return res.status(200).json(result);
        } catch(error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

    async getLeaveRequestByEmployeeId(req, res, next) {
        var result = new ReturnResult;
        try {
            var employeeId = req.params.id;
            const lstRequest = await dbContext.LeaveRequest.findAll({
                where: {
                    userId: employeeId,
                }
            });
            if(lstRequest) result.result = lstRequest;
            else result.message = "Employee not have any Leave Request";
        } catch(error) {
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

function calculateWorkingHour(startDate, endDate, timeZone = 7) {
    let workingHour = 0;
    try {
        if (startDate && endDate) {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            startDate.setHours(startDate.getHours() + timeZone);
            endDate.setHours(endDate.getHours() + timeZone);
            while (startDate.getTime() <= endDate.getTime()) {
                // Check is not Saturday or Sunday
                if (startDate.getDay() === 6 || startDate.getDay() === 0) {
                    startDate.setDate(startDate.getDate() + 1);
                    startDate.setHours(8);
                    startDate.setMinutes(30);
                    continue;
                }

                let estEndDate = new Date(startDate);
                estEndDate.setDate(estEndDate.getDate() + 1);
                estEndDate.setHours(0);
                estEndDate.setMinutes(30);
                
                if (endDate.getTime() <= estEndDate.getTime()) estEndDate = endDate;
                workingHour += calculateWorkingHourInDay(startDate, estEndDate);
                startDate.setDate(startDate.getDate() + 1);
                startDate.setHours(8);
                startDate.setMinutes(30);
            }
        }
    } catch (ex) {
        console.error(ex);
    }
    return Math.round(workingHour);
}

function calculateWorkingHourInDay(startDate, endDate, timeZoneSetting = 7) {
    let workingHour = 0;
    try {
        if (startDate.getUTCDate() === endDate.getUTCDate()) {
            var morningStartTime = new Date(startDate);
            morningStartTime.setHours(8 + timeZoneSetting);
            morningStartTime.setMinutes(30);
            var morningEndTime = new Date(startDate);
            morningEndTime.setHours(12 + timeZoneSetting);
            const morningWorkingHours = getOverlapDuration(morningStartTime, morningEndTime, startDate, endDate);
            var afternoonStartTime = new Date(startDate);
            afternoonStartTime.setHours(13 + timeZoneSetting);
            var afternoonEndTime = new Date(startDate);
            afternoonEndTime.setDate(afternoonEndTime.getDate() + 1);
            afternoonEndTime.setHours(0);
            afternoonEndTime.setMinutes(30);
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