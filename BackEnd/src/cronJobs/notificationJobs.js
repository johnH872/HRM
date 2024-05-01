import { CronJob } from 'cron';
import db from '../models/index.js';
import moment from 'moment';
import 'dotenv/config';
import { getMessaging } from 'firebase-admin/messaging';
import localRedis from '../utils/redis.js';
import { Op } from 'sequelize';
import { NotificationType } from '../models/enums/notificationType.js';
const dbContext = await db;

const notificationJobs = CronJob.from({
    cronTime: '10 * * * * *',
    onTick: async function () {
        // Auto create work calendar in the first day of the month '0 0 1 * * *'
        await generateNotification();
    },
    start: false,
    timeZone: 'Asia/Ho_Chi_Minh'
});

async function generateNotification() {
    try {
        console.log('------------- START: notificationJobs ------------------')
        var startDate = moment();
        var endDate = moment();

        // Start hour
        const morningStartTime = await getSettingByKeyAndGroup('MORNING_START', 'WORKING_TIME');
        const splittedStartHour = morningStartTime.split(':');
        startDate.set({
            hour: splittedStartHour[0],
            minute: splittedStartHour[1],
            second: 0
        });
        // const endSendNotiTime = moment(startDate).add(15,'minutes');
        const endSendNotiTimeMorning = moment(startDate).add(4, 'hours');

        // End hour
        const afternoonEndTime = await getSettingByKeyAndGroup('AFTERNOON_END', 'WORKING_TIME');
        const splittedEndHour = afternoonEndTime.split(':');
        endDate.set({
            hour: splittedEndHour[0],
            minute: splittedEndHour[1],
            second: 0
        });
        // const endSendNotiTime = moment(endDate).add(15,'minutes');
        const endSendNotiTimeAfternoon = moment(endDate).add(4, 'hours');
        if (morningStartTime && afternoonEndTime && endSendNotiTimeMorning && endSendNotiTimeAfternoon) {
            var startOfDate = moment().startOf('day');
            var endOfDate = moment().endOf('day');
            var fcmTokens = [];
            var validUserIds = [];
            var fcmTokenCache = JSON.parse(await localRedis.get(process.env.DB_HOST));
            var notificationModels = [];
            const notiTile = 'Reminder';
            const notiContent = `You haven\'t ${moment().isBefore(endDate) ? 'punched in' : 'punched out'}  yet`
            if (!fcmTokenCache) {
                console.log('------------- END: notificationJobs ------------------')
                return;
            };
            validUserIds = Object.keys(fcmTokenCache);
            // Only send notification for employees connected to the system for the 1st time and working days has been applied.
            const listEmpIds = await dbContext.User.findAll({
                raw: true,
                attributes: ['userId'],
                include: {
                    model: dbContext.WorkCalendar,
                    where: {
                        workingDate: {
                            [Op.gte]: startOfDate,
                            [Op.lte]: endOfDate,
                        },
                        workingHour: {
                            [Op.gt]: 0
                        }
                    }
                },
                where: {
                    userId: validUserIds
                }
            });

            validUserIds = listEmpIds.map(x => x.userId);
            if(validUserIds?.length <= 0) {
                console.log('------------- END: notificationJobs ------------------')
                return;
            }
            for (let userId of validUserIds) {
                fcmTokens = [...fcmTokens, ...fcmTokenCache[userId]];
                // Create model for creating notification in DB
                notificationModels.push({
                    userId,
                    type: NotificationType.ATTENDANCE_REMINDER,
                    isRead: false,
                    title: notiTile,
                    content: notiContent,
                    redirectUrl: '/attendances'
                });
            }

            // create notifications
            await dbContext.Notification.bulkCreate(notificationModels);

            const message = {
                notification: {
                    title: notiTile,
                    body: notiContent
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
            console.log(fcmTokens);
            getMessaging().sendMulticast(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
            console.log('------------- START: notificationJobs ------------------')

        }
    } catch (err) {
        console.error(err);
    }
}

const getSettingByKeyAndGroup = async (key, group) => {
    try {
        const result = await dbContext.Setting.findOne(
            {
                raw: true,
                where: {
                    key,
                    group
                }
            }
        );
        console.log(result.value);
        return result.value;
    } catch (err) {
        console.error(err);
    }
}

export {
    notificationJobs
}