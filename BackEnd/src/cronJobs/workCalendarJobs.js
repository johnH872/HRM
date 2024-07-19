import { CronJob } from 'cron';
import db from '../models/index.js';
const dbContext = await db;

const workCalendarJob = CronJob.from({
    cronTime: '0 */5 * * * *',
    onTick: async function () {
        // Auto create work calendar in the first day of the month '0 0 1 * * *'
        await generateDefaultWorkCalendar();
    },
    start: false,
    timeZone: 'Asia/Ho_Chi_Minh'
});

async function generateDefaultWorkCalendar() {
    try {
        // Get lst Employee
        var lstEmployees = await dbContext.User.findAll();
        // Get lst working type default setting
        var workingTypeSetting = await dbContext.Setting.findOne({
            where: {
                key: 'WORKING_TYPE_DEFAULT',
                group: 'WORKING_TYPE'
            }
        });
        // Get working hour default setting
        var workingHourSetting = await dbContext.Setting.findOne({
            where: {
                key: 'WORKING_HOUR_DEFAULT',
                group: 'WORKING_HOUR'
            }
        });

        lstEmployees.forEach(async employee => {
            var startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            var endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            var currentDate = startDate;
            while (currentDate.getTime() <= endDate.getTime()) {
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    continue;
                }
                var checkExistingWorkCalendarInDay = await dbContext.WorkCalendar.findOne({
                    where: {
                        userId: employee.userId,
                        workingDate: currentDate
                    }
                });
                if (checkExistingWorkCalendarInDay === null) {
                    await dbContext.WorkCalendar.create({
                        userId: employee.userId,
                        workingDate: new Date(currentDate),
                        workingType: Number(workingTypeSetting?.value) ?? 1,
                        workingHour: Number(workingHourSetting?.value) ?? 8
                    })
                    .then((res) => {})
                    .catch((err) => {
                      console.error(err);
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
    } catch (err) {
        console.error(err);
    }
}

export {
    workCalendarJob
}