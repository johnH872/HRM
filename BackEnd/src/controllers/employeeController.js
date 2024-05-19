import { hash } from "bcrypt";
import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
import { Page } from "../models/DTO/page.js";
import { PagedData } from "../models/DTO/pagedData.js";
import { Op, Sequelize, where } from "sequelize";
import { filterData, mappingPage, pagingData } from "../utils/pagingAndFiltering.js";
import { employeeValidReturnVariable } from "../utils/helper.js";
import { leaveRequestStatus } from "../models/enums/leaveRequestStatus.js";
const dbContext = await db;
class employeeController {
    async getAllEmployee(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const employeePaging = await dbContext.User.findAll({
                attributes: employeeValidReturnVariable,
                include: {
                    model: dbContext.Role,
                    through: {
                        attributes: ['roleId',],
                    }
                },
                order: [
                    [dbContext.Role, 'priority', 'ASC']
                ]
            });
            returnResult.result = employeePaging;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async getEmployeeCurrentUserRole(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            var roles = req.body;
            var roleIds = roles.map(x => x.roleId);
            var maxPriority = await dbContext.Role.min(
                'priority',
                {
                    where: {
                        roleId: roleIds
                    }
                });

            const employeePaging = await dbContext.User.findAll({
                attributes: employeeValidReturnVariable,
                include: [
                    {
                        model: dbContext.Role,
                        through: {
                            attributes: [],
                        }
                    },
                    {
                        model: dbContext.User,
                        as: 'manager',
                        attributes: employeeValidReturnVariable
                    }
                ],
                where: {
                    '$Roles.priority$': { [Op.gte]: maxPriority }
                },
                order: [
                    [dbContext.Role, 'priority', 'ASC']
                ]
            });
            returnResult.result = employeePaging;
            res.status(200).json(returnResult);
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async getEmployeePaging(req, res, next) {
        var returnResult = new ReturnResult();
        var pagedData = new PagedData();
        var page = new Page();
        try {
            page = mappingPage(page, req.body);
            var roleIds = page.roles.map(x => x.roleId);
            var maxPriority = await dbContext.Role.min(
                'priority',
                {
                    where: {
                        roleId: roleIds
                    }
                });

            let queries = {};
            queries.subQuery = false,

                queries = pagingData(page, queries);
            queries = filterData(page, queries);

            // Custom filterName
            var displayNameIndex = page.filter.findIndex(x => x.prop === 'employeeName' && x.value);
            // include for manager and role
            queries.include = [
                {
                    model: dbContext.Role,
                    through: {
                        attributes: [],
                    }
                },
                {
                    model: dbContext.User,
                    as: 'manager',
                    attributes: employeeValidReturnVariable
                }
            ];
            queries.where['$Roles.priority$'] = { [Op.gte]: maxPriority };
            if (displayNameIndex !== -1) {
                queries.where['$and'] = Sequelize.where(Sequelize.fn('concat', Sequelize.col('User.firstName'), ' ', Sequelize.col('User.middleName'), ' ', Sequelize.col('User.lastName')), {
                    [Op.substring]: page.filter[displayNameIndex].value,
                });
            }

            const employeePaging = await dbContext.User.findAll(queries);

            pagedData.Data = employeePaging;
            pagedData.Page = page;
            returnResult.result = pagedData;
        } catch (error) {
            res.status(400).json(error);
            console.log(error)
        }
        res.status(200).json(returnResult);
    }

    async saveEmployee(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.userId === null) { // Add new
                // Check email is existing
                const existEmployee = await dbContext.User.findOne({
                    where: { email: model.email }
                });
                if (existEmployee) {
                    result.message = "Email already exists";
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
                        birth: model.birth,
                        gender: model.gender,
                        nationality: model.nationality,
                        avatarUrl: model.avatarUrl,
                        phoneNumber: model.phoneNumber,
                        jobTitle: model.jobTitle,
                        dateStartContract: model.dateStartContract,
                        ownerId: model.ownerId,
                    });
                    if (saveEmployee) {
                        if (model.roleId && model.roleId.length > 0) {
                            model.roleId.map(async item => {
                                const employeeRole = await dbContext.User_Role.create({
                                    userId: saveEmployee.userId,
                                    roleId: item,
                                });
                            });
                        }
                        result.result = saveEmployee;
                    } else {
                        result.message = 'Can not save employee';
                    }
                }
            } else { // Edit
                // Find existing employee
                const existEmployee = await dbContext.User.findOne({
                    where: { userId: model.userId }
                });
                if (existEmployee) {
                    if (model.password) {
                        model.password = await hash(model.password, 10);
                    }
                    const saveEmployee = await dbContext.User.update({
                        email: model.email ?? existEmployee.email,
                        password: model.password ?? existEmployee.password,
                        firstName: model.firstName ?? existEmployee.firstName,
                        middleName: model.middleName ?? existEmployee.middleName,
                        lastName: model.lastName ?? existEmployee.lastName,
                        gender: model.gender ?? existEmployee.gender,
                        nationality: model.nationality ?? existEmployee.nationality,
                        birth: model.birth,
                        avatarUrl: model.avatarUrl ?? existEmployee.avatarUrl,
                        phoneNumber: model.phoneNumber ?? existEmployee.phoneNumber,
                        jobTitle: model.jobTitle ?? existEmployee.jobTitle,
                        dateStartContract: model.dateStartContract ?? existEmployee.dateStartContract,
                        ownerId: model.ownerId ?? existEmployee.ownerId,
                    }, {
                        where: {
                            userId: model.userId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveEmployee) {
                        if (model.roleId && model.roleId.length > 0) {
                            await dbContext.User_Role.destroy({
                                where: {
                                    userId: model.userId,
                                }
                            });
                            model.roleId.map(async item => {
                                await dbContext.User_Role.create({
                                    userId: model.userId,
                                    roleId: item,
                                });
                            });
                        }
                        result.result = await dbContext.User.findOne({
                            where: {
                                userId: model.userId
                            },
                            include:
                            {
                                model: dbContext.User,
                                as: 'manager',
                                attributes: employeeValidReturnVariable
                            }
                        });
                    } else {
                        result.message = 'Can not save employee';
                    }
                } else {
                    result.message = 'Employee not found';
                }
            }
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

    async getEmployeeById(req, res, next) {
        var result = new ReturnResult;
        try {
            var employeeId = req.params.id;
            const employee = await dbContext.User.findByPk(employeeId, {
                attributes: employeeValidReturnVariable,
                include: [
                    {
                        model: dbContext.User,
                        as: 'manager',
                        attributes: employeeValidReturnVariable
                    },
                    {
                        model: dbContext.Role,
                        through: {
                            attributes: ['roleId'],
                        }
                    }
                ],
            });
            if (employee) result.result = employee;
        } catch (error) {
            console.error(error);
        }
        return res.status(200).json(result);
    }

    async deleteEmployee(req, res, next) {
        var result = new ReturnResult;
        try {
            var ids = req.body;
            result.result = false;
            const removedEmployees = await dbContext.User.destroy({
                where: {
                    userId: ids
                }
            });
            if (removedEmployees) result.result = true;
        } catch (error) {
            console.error(error);
        }
        return res.status(200).json(result);
    }

    async getOwnersByEmployeeId(req, res, next) {
        var result = new ReturnResult;
        try {
            var employeeId = req.query.employeeId;
            const resp = await dbContext.User.findAll({
                where: {
                    ownerId: employeeId,

                }
            });
            if (resp) result.result = resp;
            else result.message = "No such employee";
        } catch (error) {
            console.error(error);
        }
        return res.status(200).json(result);
    }

    async getDashboardData(req, res, next) {
        var result = new ReturnResult;
        try {
            const date = new Date(), y = date.getFullYear(), m = date.getMonth();
            const firstDayOfMonth = new Date(y, m, 0);
            const lastDayOfMonth = new Date(y, m + 1, 0);
            const { employeeId, myEmail } = req.query;

            const users = await dbContext.User.findAll({
                where: {
                    ownerId: employeeId
                },
                attributes: [
                    'email'
                ]
            });
            const emails = users.map(x => x.email);

            const leaveRequests = await dbContext.LeaveRequest.findAll({
                include: [
                    {
                        model: dbContext.User,
                        attributes: employeeValidReturnVariable,
                        where: {
                            ownerId: employeeId,
                        },
                    },
                    {
                        model: dbContext.DataState
                    }
                ],
                where: {
                    status: leaveRequestStatus.WAITING,
                }
            });


            const attendanceReports = await dbContext.AttendanceReport.findAll({
                include: [
                    {
                        model: dbContext.User,
                        attributes: employeeValidReturnVariable,
                    },
                    {
                        model: dbContext.DataState,
                        as: 'status'
                    }
                ],
                where: {
                    statusId: leaveRequestStatus.WAITING,
                    email: emails
                }
            });

            const myWorkingDetail = await dbContext.WorkCalendarDetail.findAll({
                include:
                {
                    model: dbContext.WorkCalendar,
                    attributes: ['userId'],
                    where: {
                        userId: employeeId,
                    }
                },
            });

            const requiredWorkingHours = await dbContext.WorkCalendar.sum('workingHour', {
                where: {
                    userId: employeeId,
                    workingDate: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth]
                    }
                }
            });
            const workedHourData = await dbContext.Attendance.findAll({
                raw: true,
                attributes: [
                    [Sequelize.literal(`ROUND(TIMESTAMPDIFF(SECOND,punchinDate, punchoutDate)/3600, 2)`), 'workedHours']
                ],
                where: {
                    [Op.not]: { punchinDate: null },
                    [Op.not]: { punchoutDate: null },
                    punchinDate: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth]
                    }
                }
            });

            const leaveHours = await dbContext.LeaveRequest.sum('numberOfHour', {
                where: { userId: employeeId }
            })

            const workedHours = workedHourData.reduce((accumulator, data) => accumulator + Number(data.workedHours), 0.0);

            const waitingLeaveRequests = leaveRequests.filter(x => x.userId != employeeId);
            const waitingAttendanceReports = attendanceReports.filter(x => x.email != myEmail);
            const myLeaveRequest = leaveRequests.filter(x => x.userId == employeeId);
            const myAttendanceReports = attendanceReports.filter(x => x.email == myEmail);

            const resData = {
                waitingLeaveRequests,
                waitingAttendanceReports,
                myLeaveRequest,
                myAttendanceReports,
                myWorkingDetail,
                requiredWorkingHours,
                workedHours,
                leaveHours
            }

            if (resData) result.result = resData;
        } catch (error) {
            console.error(error);
        }
        return res.status(200).json(result);
    }
}

export default new employeeController;