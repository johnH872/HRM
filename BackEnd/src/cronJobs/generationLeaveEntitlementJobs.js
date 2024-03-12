import { CronJob } from 'cron';
import { LeaveEntitlement } from '../models/leave_entitlement.js'

const generationLeaveEntitlement = CronJob.from({
    cronTime: '0 0 * * * *',
    onTick: async function () {
        var currentDate = new Date();
        var checkExistThisYear = LeaveEntitlement.findAll({
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
    generationLeaveEntitlement
}