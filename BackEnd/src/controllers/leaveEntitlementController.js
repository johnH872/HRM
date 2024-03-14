import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;

class LeaveEntitlementController {
    async getAllLeaveEntitlement(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const leaveEntitlementPaging = await dbContext.LeaveEntitlement.findAll({
                include: [
                    {
                        model: dbContext.LeaveType,
                    },
                    {
                        model: dbContext.User,
                    },
                ],
                // order: [
                //     ['isPaidSalary', 'DESC']
                // ]
            });
            returnResult.result = leaveEntitlementPaging;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveLeaveEntitlement(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.leaveEntitlementId === null) { // Add new
                var checkExistThisYearEntitlement = await dbContext.LeaveEntitlement.findOne({
                    where: {
                        userId: model.userId,
                        leaveTypeId: model.leaveTypeId,
                        effectedYear: model.effectedYear
                    }
                });
                if (checkExistThisYearEntitlement) {
                    result.message = 'This leave element with this type for this year is already exists.';
                } else {
                    const saveLeaveEntitlement = await dbContext.LeaveEntitlement.create({
                        userId: model.userId,
                        leaveTypeId: model.leaveTypeId,
                        startDate: model.startDate,
                        endDate: model.endDate,
                        availableLeave: model.availableLeave,
                        usableLeave: model.usableLeave,
                        usedLeave: model.usedLeave,
                        effectedYear: model.effectedYear,
                    });
                    if (saveLeaveEntitlement) {
                        result.result = saveLeaveEntitlement;
                    } else {
                        result.message = 'Can not save leave entitlement';
                    }
                }
                return res.status(200).json(result);
            } else { // Edit
                // Find existing leave entitlement
                const existLeaveEntitlement = await dbContext.LeaveEntitlement.findOne({
                    where: {
                        leaveEntitlementId: model.leaveEntitlementId
                    }
                });
                if (existLeaveType) {
                    const saveLeaveEntitlement = await dbContext.LeaveEntitlement.update({
                        availableLeave: model.availableLeave ?? existLeaveEntitlement.availableLeave,
                        usableLeave: model.usableLeave ?? existLeaveEntitlement.usableLeave,
                        usedLeave: model.usedLeave ?? existLeaveEntitlement.usedLeave,
                    }, {
                        where: {
                            leaveEntitlementId: model.leaveEntitlementId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveLeaveEntitlement) {
                        result.result = await dbContext.LeaveEntitlement.findOne({
                            where: {
                                leaveEntitlementId: model.leaveEntitlementId
                            }
                        });
                        return res.status(200).json(result);
                    } else {
                        result.message = 'Can not save leave entitlement';
                        return res.status(200).json(result);
                    }
                } else {
                    result.message = 'Leave Entitlement not found';
                    return res.status(200).json(result);
                }
            }
        } catch(error) {
            res.status(400).json(error);
            console.log(error);
        }
    }
}

export default new LeaveEntitlementController;