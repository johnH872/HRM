import Role_Permission from "../models/rolepermission";
import Permission from "../models/permission";

class Helper {
    constructor(){};

    checkPermission(roleId, permissionName) {
        return new Promise(
            (resolve, reject) => {
                Permission.findOne({
                    where: {
                        permission: permissionName
                    }
                }).then((permission) => {
                    Role_Permission.findOne({
                        where: {
                            roleId: roleId,
                            permissionId: permission.permissionId
                        }
                    }).then((rolePermission) => {
                        if(rolePermission) {
                            resolve(rolePermission);
                        } else {
                            reject({message: "Forbidden ne"})
                        }
                    }).catch((error) => reject(error));
                }).catch((error) => reject(error));
            }
        );
    }
}