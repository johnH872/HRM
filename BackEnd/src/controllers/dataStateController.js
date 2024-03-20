import db from '../models/index.js'
import { ReturnResult } from "../models/DTO/returnResult.js";

const dbContext = await db;

class DataStateController {
    async getDataStateAll(req, res, next) {
        try {
            var result = new ReturnResult();
            const data = await dbContext.DataState.findAll({

            });
            if (data && data.length > 0) {
                result.result = data;
            } else {
                result.message = "No data found!";
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
        }
    }

    async saveDataState(req, res, next) {
        var result = new ReturnResult();
        try {
            const model = req.body;
            if (model.dataStateId === null) { // Add new
                const saveDataState = await dbContext.DataState.create({
                    dataStateName: model.dataStateName,
                    type: model.type,
                    colorCode: model.colorCode,
                    order: model.order
                });
                if (saveDataState) {
                    result.result = saveDataState;
                } else {
                    result.message = 'Can not save data state';
                }
            } else { // Edit
                const existDataState = await dbContext.DataState.findOne({
                    where: {
                        dataStateId: model.dataStateId
                    }
                });
                if (existDataState) {
                    const saveDataState = await dbContext.DataState.update({
                        dataStateName: model.dataStateName ?? existDataState.dataStateName,
                        type: model.type ?? existDataState.type,
                        colorCode: model.colorCode ?? existDataState.colorCode,
                        order: model.order ?? existDataState.order
                    }, {
                        where: {
                            dataStateId: model.dataStateId
                        },
                        returning: true,
                        plain: true
                    });
                    if (saveDataState) {
                        result.result = await dbContext.DataState.findOne({
                            where: {
                                dataStateId: model.dataStateId
                            }
                        });
                    } else {
                        result.message = 'Can not save data state';
                    }
                } else {
                    result.message = 'Data state not found';
                }
            }
            return res.status(200).json(result);
        } catch(error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

    async getDataStateByType(req, res, next) {
        var result = new ReturnResult;
        try {
            var reqType = req.query.type;
            const lstDataState = await dbContext.DataState.findAll({
                where: {
                    type: reqType,
                }
            });
            if(lstDataState && lstDataState.length > 0) result.result = lstDataState;
            else result.message = "No data found";
            return res.status(200).json(result);
        } catch(error) {
            console.error(error);
            return res.status(400).json(error);
        }
    }

    async getDataStateByTypeAndName(req, res, next) {
        var result = new ReturnResult;
        try {
            var reqType = req.query.type;
            var reqName = req.query.name;
            const dataState = await dbContext.DataState.findOne({
                where: {
                    dataStateName: reqName,
                    type: reqType,
                }
            });
            if(dataState) result.result = dataState;
            else result.message = "No data found";
            return res.status(200).json(result);
        } catch(error) {
            console.error(error);
            return res.status(400).json(error);
        }
    }

    async onDeletes(req, res, next) {
        
    }
}

export default new DataStateController;