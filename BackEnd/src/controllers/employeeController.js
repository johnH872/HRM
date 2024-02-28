import { hash } from "bcrypt";
import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;
class employeeController {
    async getEmployeePaging(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const employeePaging = await dbContext.User.findAll({where: {deletedAt: null}});
            returnResult.result = employeePaging;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveEmployee(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.userId === null) { // Add new
                // Check email is existing
                const existEmployee = await dbContext.User.findOne({
                    where: {email: model.email}
                });
                if (existEmployee) {
                    result.message = "Email already exists";
                    return res.status(200).json(result);
                } else {
                    // Set default password
                    if (model.password === null) {
                        model.password = '123456';
                    }

                    // Hash password
                    model.password = await hash(model.password, 10);
                    const saveEmployee = await dbContext.User.create({
                        email: model.email,
                        password: model.password,
                        firstName: model.firstName,
                        middleName: model.middleName,
                        lastName: model.lastName,
                        gender: model.gender,
                        nationality: model.nationality,
                        avatarUrl: model.avatarUrl,
                        phoneNumber: model.phoneNumber,
                        jobTitle: model.jobTitle,
                        ownerId: model.ownerId,
                    });
                    if (saveEmployee) {
                        if (model.roles && model.roles.length > 0) {
                            model.roles.map(async item => {
                                const employeeRole = await dbContext.User_Role.create({
                                    userId: saveEmployee.userId,
                                    roleId: item,
                                });
                            });
                        }
                        result.result = saveEmployee;
                        return res.status(200).json(result);
                    } else {
                        result.message = 'Can not save employee';
                        return res.status(200).json(result);
                    }
                }
            } else { // Edit
                // Find existing employee
                const existEmployee = await dbContext.User.findOne({
                    where: {userId: model.userId}
                });
                if (existEmployee) {
                    if (model.password !== null) {
                        model.password = await hash(model.password, 10);
                    }
                    const saveEmployee = await dbContext.User.update({
                        email: model.email ?? existEmployee.email,
                        password: model.password,
                        firstName: model.firstName ?? existEmployee.firstName,
                        middleName: model.middleName ?? existEmployee.middleName,
                        lastName: model.lastName ?? existEmployee.lastName,
                        gender: model.gender ?? existEmployee.gender,
                        nationality: model.nationality ?? existEmployee.nationality,
                        avatarUrl: model.avatarUrl ?? existEmployee.avatarUrl,
                        phoneNumber: model.phoneNumber ?? existEmployee.phoneNumber,
                        jobTitle: model.jobTitle ?? existEmployee.jobTitle,
                        ownerId: model.ownerId ?? existEmployee.ownerId,
                    }, {
                        where: {userId: model.userId}
                    });
                    if (saveEmployee) {
                        if (model.roles && model.roles.length > 0) {
                            await dbContext.User_Role.destroy({
                                where: {
                                  userId: saveEmployee.userId,
                                }
                              });
                            model.roles.map(async item => {
                                await dbContext.User_Role.create({
                                    userId: saveEmployee.userId,
                                    roleId: item,
                                });
                            });
                        }
                        result.result = saveEmployee;
                        return res.status(200).json(result);
                    } else {
                        result.message = 'Can not save employee';
                        return res.status(200).json(result);
                    }
                } else {
                    result.message = 'Employee not found';
                    return res.status(200).json(result);
                }
            }
        } catch(error) {
            res.status(400).json(error);
            console.log(error);
        }
    }
}

export default new employeeController;