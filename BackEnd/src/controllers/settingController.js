import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
const dbContext = await db;

class settingController {
    async getAllSetting(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const result = await dbContext.Setting.findAll();
            returnResult.result = result;
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async getSettingByKeyAndGroup(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const key = req.query.key;
            const group = req.query.group;
            const result = await dbContext.Setting.findOne(
                {
                    where: {
                        key: key,
                        group: group
                    }
                }
            );
            if (result) {
                returnResult.result = result;
            } else {
                returnResult.message = 'Can not find setting with key "' + key + '" and group "' + group + '"';
            }
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async getSettingByGroup(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const group = req.query.group;
            const result = await dbContext.Setting.findAll(
                {
                    where: {
                        group: group
                    }
                }
            );
            if (result) {
                returnResult.result = result;
            } else {
                returnResult.message = 'Can not find setting with group "' + group + '"';
            }
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }

    async saveSetting(req, res, next) {
        var returnResult = new ReturnResult();
        try {
            const oldSetting = req.body.oldSetting;
            const newSetting = req.body.newSetting;
            var existingSetting = null;
            if (oldSetting.key && oldSetting.group) {
                existingSetting = await dbContext.Setting.findOne({
                    where: {
                        key: oldSetting?.key,
                        group: oldSetting?.group
                    }
                });
            }
            var checkNewSetting = await dbContext.Setting.findOne({
                where: {
                    key: newSetting?.key,
                    group: newSetting?.group,
                    value: newSetting?.value
                }
            });

            if (checkNewSetting != null) {
                returnResult.message = 'The setting with key "' + newSetting.key + 'and group "' + newSetting.group + '" already exists."';
            } else if (existingSetting == null) { // add new case
                const saveNewSetting = await dbContext.Setting.create({
                    key: newSetting.key,
                    group: newSetting.group,
                    value: newSetting.value
                });
                if (saveNewSetting) returnResult.result = saveNewSetting;
                else returnResult.message = 'Can not save setting with key "' + newSetting.key + 'and group "' + newSetting.group;
            } else { // edit case
                const updateSetting = await dbContext.Setting.update(
                    {
                        key: newSetting.key,
                        group: newSetting.group,
                        value: newSetting.value
                    }, {
                        where: {
                            key: oldSetting.key,
                            group: oldSetting.group
                        }
                    }
                );
                if (updateSetting) returnResult.result = newSetting;
                else returnResult.message = 'Can not save setting with key "' + newSetting.key + 'and group "' + newSetting.group;
            }
            res.status(200).json(returnResult);
        } catch(error) {
            res.status(400).json(error);
            console.log(error)
        }
    }
}

export default new settingController;