import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;

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
            if (model.leaveRequestId === null) { // Add new
                var checkExistThisYearRequest = await dbContext.LeaveRequest.findOne({
                    where: {
                        userId: model.userId,
                        leaveTypeId: model.leaveTypeId,
                        effectedYear: model.effectedYear
                    }
                });
                if (checkExistThisYearRequest) {
                    result.message = 'This leave element with this type for this year is already exists.';
                } else {
                    const saveLeaveRequest = await dbContext.LeaveRequest.create({
                        userId: model.userId,
                        leaveTypeId: model.leaveTypeId,
                        startDate: model.startDate,
                        endDate: model.endDate,
                        availableLeave: model.availableLeave,
                        usableLeave: model.usableLeave,
                        usedLeave: model.usedLeave,
                        effectedYear: model.effectedYear,
                    });
                    if (saveLeaveRequest) {
                        result.result = saveLeaveRequest;
                    } else {
                        result.message = 'Can not save Leave Request';
                    }
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
                        availableLeave: model.availableLeave ?? existLeaveRequest.availableLeave,
                        usableLeave: model.usableLeave ?? existLeaveRequest.usableLeave,
                        usedLeave: model.usedLeave ?? existLeaveRequest.usedLeave,
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

export default new LeaveRequestController;