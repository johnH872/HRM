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
                        model: dbContext.LeaveEntitlement,
                        include: [
                            {
                                model: dbContext.LeaveType,
                            },
                        ],
                    },
                    {
                        model: dbContext.User,
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
            model.numberOfHour = calculateNumberOfHours(model.leaveDateFrom, model.leaveDateTo);
            if (model.leaveRequestId === null) { // Add new
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
                if (existLeaveType) {
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

    async handleLeaveEntitlementForLeaveRequest(userId, leaveEntitlementId) {
        const totalNumberOfHoursUsed = await dbContext.LeaveRequest.sum('numberOfHour', { 
            where: { 
                userId: userId,
                leaveEntitlementId: leaveEntitlementId 
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
}

function calculateNumberOfHours(start, end) {
    const start1 = moment(start, 'DD/MM/YYYY HH:mm');
    const end1 = moment(end, 'DD/MM/YYYY HH:mm');

    const startRange1 = moment(start1).set({ hour: 8, minute: 30 });
    const endRange1 = moment(start1).set({ hour: 12, minute: 0 });
    const startRange2 = moment(start1).set({ hour: 13, minute: 0 });
    const endRange2 = moment(start1).set({ hour: 17, minute: 30 });

    let totalHours = 0;

    if (end1.isAfter(startRange1) && start1.isBefore(endRange1)) {
        const rangeStart = start1.isBefore(startRange1) ? startRange1 : start1;
        const rangeEnd = end1.isAfter(endRange1) ? endRange1 : end1;
        const duration = moment.duration(rangeEnd.diff(rangeStart));
        totalHours += duration.asHours();
    }

    if (end1.isAfter(startRange2) && start1.isBefore(endRange2)) {
        const rangeStart = start1.isBefore(startRange2) ? startRange2 : start1;
        const rangeEnd = end1.isAfter(endRange2) ? endRange2 : end1;
        const duration = moment.duration(rangeEnd.diff(rangeStart));
        totalHours += duration.asHours();
    }

    return totalHours;
}

export default new LeaveRequestController;