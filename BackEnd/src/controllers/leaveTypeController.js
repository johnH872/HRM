import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;

class LeaveTypeController {
    async getAllLeaveType(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const leaveTypePaging = await dbContext.LeaveType.findAll({
                order: [
                    ['isPaidSalary', 'DESC']
                ]
            });
            returnResult.result = leaveTypePaging;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveLeaveType(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.leaveTypeId === null) { // Add new
                const saveLeaveType = await dbContext.LeaveType.create({
                    leaveTypeName: model.leaveTypeName,
                    defaultStartDay: model.defaultStartDay,
                    defaultStartMonth: model.defaultStartMonth,
                    defaultEndDay: model.defaultEndDay,
                    defaultEndMonth: model.defaultEndMonth,
                    defaultBudget: model.defaultBudget,
                    isPaidSalary: model.isPaidSalary,
                });
                if (saveLeaveType) {
                    result.result = saveLeaveType;
                    return res.status(200).json(result);
                } else {
                    result.message = 'Can not save leave type';
                    return res.status(200).json(result);
                }
            } else { // Edit
                // Find existing leave type
                const existLeaveType = await dbContext.LeaveType.findOne({
                    where: {leaveTypeId: model.leaveTypeId}
                });
                if (existLeaveType) {
                    const saveLeaveType = await dbContext.LeaveType.update({
                        leaveTypeName: model.leaveTypeName ?? existLeaveType.leaveTypeName,
                        defaultStartDay: model.defaultStartDay ?? existLeaveType.defaultStartDay,
                        defaultStartMonth: model.defaultStartMonth ?? existLeaveType.defaultStartMonth,
                        defaultEndDay: model.defaultEndDay ?? existLeaveType.defaultEndDay,
                        defaultEndMonth: model.defaultEndMonth ?? existLeaveType.defaultEndMonth,
                        defaultBudget: model.defaultBudget ?? existLeaveType.defaultBudget,
                        isPaidSalary: model.isPaidSalary ?? existLeaveType.isPaidSalary,
                    }, {
                        where: {
                            leaveTypeId: model.leaveTypeId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveLeaveType) {
                        result.result = await dbContext.LeaveType.findOne({
                            where: {leaveTypeId: model.leaveTypeId}
                        });
                        return res.status(200).json(result);
                    } else {
                        result.message = 'Can not save leave type';
                        return res.status(200).json(result);
                    }
                } else {
                    result.message = 'Leave Type not found';
                    return res.status(200).json(result);
                }
            }
        } catch(error) {
            res.status(400).json(error);
            console.log(error);
        }
    }
}

export default new LeaveTypeController;