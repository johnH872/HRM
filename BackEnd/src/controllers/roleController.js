import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;

class roleController {
    async getRoles(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const result = await dbContext.Role.findAll({where: {deletedAt: null}});
            returnResult.result = result;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveRole(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const role = req.body;
            returnResult.result = false;
            if(role.roleId) {
                const updatedRole = await dbContext.Role.update({
                    roleName: role.roleName,
                    roleDescription: role.roleDescription,
                    displayName: role.displayName,
                    defaultScreen: role.defaultScreen,
                    priority: role.priority,
                    isShow: role.isShow,   
                }, {
                    where: {
                        roleId: role.roleId
                    }
                });
                if(updatedRole) returnResult.result = true;
            } else {
                const newRole = await dbContext.Role.create({
                    roleName: role.roleName,
                    roleDescription: role.roleDescription,
                    displayName: role.displayName,
                    defaultScreen: role.defaultScreen,
                    priority: role.priority,
                    isShow: role.isShow,   
                });
                if(newRole) returnResult.result = true;
            }
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async deleteRoles(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const removeIds = req.body;
            returnResult.result = false;
            if(removeIds?.length > 0) {
                const updatedRes = await dbContext.Role.destroy({
                    where: {
                        roleId: removeIds
                    }   
                });
                if (updatedRes) {
                    returnResult.result = true;
                }
            }
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new roleController;