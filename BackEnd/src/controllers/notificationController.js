import { ReturnResult } from "../models/DTO/returnResult.js";
import db from '../models/index.js'
import localRedis from "../utils/redis.js";
import 'dotenv/config';
const dbContext = await db;

class NotificationController {
    async getAllNotification(req, res, next) {
        var result = new ReturnResult();
        try {
            const userId = req.params.userId;
            const notifications = await dbContext.Notification.findAll({
                where: {
                    userId
                },
                order: [
                    ['createdAt', 'DESC'],
                ],
            })
            result.result = notifications;
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

    async markRead(req, res, next) {
        var result = new ReturnResult();
        try {
            result.result = false;
            const { notificationId, userId } = req.params;
            var isMarkAll = !notificationId ? true : false;
            var whereClause = isMarkAll ? { userId } : { notificationId };
            const notifications = await dbContext.Notification.update(
                {
                    isRead: true
                },
                {
                    where: whereClause,
                },)
            if (notifications) result.result = true;
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    }

    async saveFCMToken(req, res, next) {
        var result = new ReturnResult();
        try {
            const { token } = req.body;
            const userId = req.params.userId;
            localRedis.get(process.env.DB_HOST, async (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    var model = JSON.parse(result);
                    if (!model) {
                        model = {};
                        model[userId] = [token];
                    } else {
                        if (model?.[userId]?.length > 0) {
                            if (!model[userId].includes(token)) {
                                model[userId] = [...model[userId], token];
                            }
                        }
                        else model[userId] = [token];

                        // find token in other user and remove it
                        // if(model) {
                        //     const keys = (model?.keys())?.filter(x => x != userId) || '';
                        //     if (model[userId].includes(token)) {
                        //         for (let key of keys) {
                        //             const index = model[key].indexOf(token);
                        //             if (model?.[key]?.length > 0 && index > -1) {
                        //                 model[key] = [...array.splice(index, 1)];
                        //             }
                        //         }
                        //     }
                        // }
                    }
                    localRedis.set(process.env.DB_HOST, JSON.stringify(model));
                }
            });
            result.result = true;
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    }
}

export default new NotificationController;