import { CronJob } from 'cron';
import db from '../models/index.js'
const dbContext = await db;

const generationLeaveEntitlementJob = CronJob.from({
    cronTime: '0 0 * * * *',
    onTick: async function () {
        var currentDate = new Date();
        var checkExistThisYear = await dbContext.LeaveEntitlement.findAll({
            where: {
                effectedYear: currentDate.getFullYear(),
            }
        });
        if (!checkExistThisYear) {
            await generationLeaveEntitlement();
        }
    },
    start: false,
    timeZone: 'Asia/Ho_Chi_Minh'
});

async function generationLeaveEntitlement() {

}

export {
    generationLeaveEntitlementJob
}