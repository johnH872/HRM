import { socketIO } from "../app.js";
import localRedis from "./redis.js";
import 'dotenv/config';
import db from '../models/index.js'
import moment from "moment";
import { getMessaging } from "firebase-admin/messaging";
const dbContext = await db;

export const sendNotification = async (title, content, redirectUrl, type, userId) => {
    let result = true;
    try {
        var notificationModels = [];
        const fcmTokenCache = JSON.parse(await localRedis.get(process.env.DB_HOST));
        var fcmTokens = [...fcmTokenCache[userId] || []];
        notificationModels.push({
            userId,
            type,
            isRead: false,
            title,
            content,
            redirectUrl
        });

        await dbContext.Notification.bulkCreate(notificationModels);

        // send socket for web
        socketIO.emit(process.env.NOTIFICATION, {
            type: 'NOTIFICATION',
            notificationType: type,
            userIds: [userId]
        });

        if (fcmTokens.length <= 0) {
            console.log('------------- END: no tokens ------------------');
            result = true;
            return result;
        }
 
        fcmTokens = [...new Set(fcmTokens)];
        const message = {
            notification: {
                title,
                body: content
            },
            android: {
                notification: {
                    icon: 'stock_ticker_update',
                    color: '#6F5D0D'
                }
            },
            data: {
                sendNotiTime: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
            },
            tokens: fcmTokens
        };

        // Send a message to the device corresponding to the provided
        // registration token.
        getMessaging().sendEachForMulticast(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
                console.log('------------- END: notificationJobs ------------------')
            })
            .catch((error) => {
                console.log('Error sending message:', error);
                console.log('------------- END: notificationJobs ------------------')
            });

    } catch (err) {
        result = false;
        console.error(err);
    }
    return result;
}