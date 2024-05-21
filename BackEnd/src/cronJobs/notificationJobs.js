import { CronJob } from 'cron';
import db from '../models/index.js';
import moment from 'moment';
import 'dotenv/config';
import { getMessaging } from 'firebase-admin/messaging';
import localRedis from '../utils/redis.js';
import { Op } from 'sequelize';
import { NotificationType } from '../models/enums/notificationType.js';
import { socketIO } from '../app.js';
const dbContext = await db;

const notificationJobs = CronJob.from({
    cronTime: '0 */5 * * * *',
    onTick: async function () {
        // Auto create work calendar in the first day of the month '0 0 1 * * *'
        await generateNotification();
    },
    start: false,
    timeZone: 'Asia/Ho_Chi_Minh'
});

async function generateNotification() {
    try {
        console.log(`------------- START: notificationJobs ${moment().format('HH:mm')} ------------------`)
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
        const endSendNotiTimeMorning = moment(startDate).add(30, 'minutes');
        // const endSendNotiTimeMorning = moment(startDate).add(4, 'hours');

        // End hour
        const afternoonEndTime = await getSettingByKeyAndGroup('AFTERNOON_END', 'WORKING_TIME');
        const splittedEndHour = afternoonEndTime.split(':');
        endDate.set({
            hour: splittedEndHour[0],
            minute: splittedEndHour[1],
            second: 0
        });
        const endSendNotiTimeAfternoon = moment(endDate).add(30, 'minutes');
        // const endSendNotiTimeAfternoon = moment(endDate).add(6, 'hours');
        if (
            endDate
            && startDate
            && endSendNotiTimeMorning
            && endSendNotiTimeAfternoon
            && (moment().isBetween(endDate, endSendNotiTimeAfternoon) || moment().isBetween(startDate, endSendNotiTimeMorning))) {

            var startOfDate = moment().startOf('day');
            var endOfDate = moment().endOf('day');
            var fcmTokens = [];
            var validUserIds = [];
            var fcmTokenCache = JSON.parse(await localRedis.get(process.env.DB_HOST));
            var notificationModels = [];
            const notiTile = 'Reminder';
            const notiContent = `You haven\'t ${moment().isBefore(endDate) ? 'punched in' : 'punched out'}  yet`

            if (!fcmTokenCache) {
                console.log('------------- END: notificationJobs (no token devices) ------------------')
                return;
            };
            validUserIds = Object.keys(fcmTokenCache);
            // Only send notification for employees connected to the system for the 1st time 
            // && working days has been applied.
            // && haven't punch in or out yet
            const whereClauseAttendance = moment().isBetween(startDate, endSendNotiTimeMorning) ? {
                punchinDate: {
                    [Op.between]: [startOfDate, endOfDate],
                },
            } : {
                punchinDate: {
                    [Op.between]: [startOfDate, endOfDate],
                },
                punchoutDate: {
                    [Op.eq]: null,
                },
            };

            const listEmpIds = await dbContext.User.findAll({
                // raw: true,
                attributes: ['userId'],
                include: [
                    {
                        model: dbContext.WorkCalendar,
                        where: {
                            workingDate: {
                                [Op.between]: [startOfDate, endOfDate],
                            },
                            workingHour: {
                                [Op.gt]: 0
                            }
                        }
                    },
                    {
                        model: dbContext.Attendance,
                        where: whereClauseAttendance
                    }
                ],
                where: {
                    userId: validUserIds
                }
            });

            // Only send noti when user haven't punched in the morning
            // && punched in but haven't punched out in the afternoon
            if (moment().isBetween(startDate, endSendNotiTimeMorning)) {
                if (listEmpIds.length != 0) {
                    const removeUserIds = [...new Set(listEmpIds.filter(x => x.Attendances?.length === 0).map(x => x.userId))];
                    validUserIds = validUserIds.filter((el) => !removeUserIds.includes(el));
                } else validUserIds = [...new Set(validUserIds)]
                console.log(validUserIds);
            }
            else validUserIds = [...new Set(listEmpIds.filter(x => x.Attendances?.length > 0).map(x => x.userId))];
            if (validUserIds?.length <= 0) {
                console.log('------------- END: notificationJobs (0 - notification sent)------------------')
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
            // send socket for web
            socketIO.emit(process.env.NOTIFICATION, {
                type: 'NOTIFICATION',
                notificationType: NotificationType.ATTENDANCE_REMINDER,
                userIds: validUserIds
            });

            if (fcmTokens.length <= 0) {
                console.log('------------- END: no tokens ------------------');
                return;
            }
            fcmTokens = [...new Set(fcmTokens)];
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
            getMessaging().sendEachForMulticast(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                    console.log('------------- END: notificationJobs ------------------')
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    console.log('------------- END: notificationJobs ------------------')
                });

        } else {
            console.log('------------- END: notificationJobs (out of time) ------------------')
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