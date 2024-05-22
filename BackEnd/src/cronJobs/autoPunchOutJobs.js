import { CronJob } from 'cron';
import db from '../models/index.js';
const dbContext = await db;

const autoPunchOutJob = CronJob.from({
    cronTime: '0 0 23 * * *',
    onTick: async function () {
        // Auto create work calendar in the first day of the month '0 0 1 * * *'
        await handleAutoPunchOutJob();
    },
    start: false,
    timeZone: 'Asia/Ho_Chi_Minh'
});

async function handleAutoPunchOutJob() {
    try {
        const [results, metadata] = await sequelize.query(`
        UPDATE attendances 
        SET punchoutDate = ADDTIME(STR_TO_DATE(CONCAT(DATE(punchinDate), '17:00:00'), '%Y-%m-%d %T'), '20:00:00.000000'),
            punchoutTime = UNIX_TIMESTAMP(ADDTIME(STR_TO_DATE(CONCAT(DATE(punchinDate), ' 17:00:00'), '%Y-%m-%d %T'), '27:00:00.000000'))*1000,
            punchoutOffset = -420,
            punchoutNote = 'Auto punch out from the system',
            punchOutImageUrl = 'https://static.vecteezy.com/system/resources/previews/010/886/508/original/self-service-checkout-cartoon-icon-vector.jpg'
        WHERE punchoutDate IS NULL`);

    } catch (err) {
        console.error(err);
    }
}

export {
    autoPunchOutJob
}