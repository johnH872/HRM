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
            model.numberOfHour = calculateNumberOfHours(model.leaveDateFrom, model.leaveDateTo);
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

function calculateNumberOfHours(start, end) {
    const startMoment = moment(start).add(7, 'hours');
    const endMoment = moment(end).add(7, 'hours');
  
    const startRange1 = moment(startMoment).set({ hour: 8, minute: 30 });
    const endRange1 = moment(startMoment).set({ hour: 12, minute: 0 });
    const startRange2 = moment(startMoment).set({ hour: 13, minute: 0 });
    const endRange2 = moment(startMoment).set({ hour: 17, minute: 30 });
  
    let workingHours = 0;

    if (endMoment.isAfter(startRange1) && startMoment.isBefore(endRange1)) {
      const rangeStart = startMoment.isBefore(startRange1) ? startRange1 : startMoment;
      const rangeEnd = endMoment.isAfter(endRange1) ? endRange1 : endMoment;
      const duration = moment.duration(rangeEnd.diff(rangeStart));
      workingHours += duration.asHours();
    }

    if (endMoment.isAfter(startRange2) && startMoment.isBefore(endRange2)) {
      const rangeStart = startMoment.isBefore(startRange2) ? startRange2 : startMoment;
      const rangeEnd = endMoment.isAfter(endRange2) ? endRange2 : endMoment;
      const duration = moment.duration(rangeEnd.diff(rangeStart));
      workingHours += duration.asHours();
    }
  
    return workingHours;
}

export default new LeaveRequestController;