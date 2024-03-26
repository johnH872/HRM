import { CronJob } from 'cron';
import db from '../models/index.js';
import { Op, literal, col } from 'sequelize';
import { leaveType } from '../models/enums/leaveType.js';

const dbContext = await db;

const balanceLeaveEntitlementJob = CronJob.from({
  cronTime: '0 0 * * * *',
  onTick: async function () {
    await handleBalanceLeaveEntitlement();
  },
  start: false,
  timeZone: 'Asia/Ho_Chi_Minh'
});

async function handleBalanceLeaveEntitlement() {
  const timeZoneSetting = 7;
  const lstLeaveEntitlement = await dbContext.LeaveEntitlement.findAll({
    attributes: [
      'leaveEntitlementId',
      'userId',
      'leaveTypeId',
      'startDate',
      'endDate',
      'availableLeave',
      'usableLeave',
      'usedLeave',
      'effectedYear',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ],
    include: [
      {
        model: dbContext.LeaveType,
        attributes: [
          'leaveTypeId',
          'leaveTypeName',
          'defaultStartDay',
          'defaultStartMonth',
          'defaultEndDay',
          'defaultEndMonth',
          'defaultBudget',
          'isPaidSalary',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      },
      {
        model: dbContext.User,
        attributes: [
          'userId',
          'firstName',
          'middleName',
          'lastName',
          'email',
          'birth',
          'gender',
          'nationality',
          'avatarUrl',
          'phoneNumber',
          'jobTitle',
          'dateStartContract',
          'ownerId',
          'isAppliedFace',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      },
    ],
    where: {
      leaveTypeId: leaveType.ANNUALLY,
      [Op.and]: [
        literal(`DATE_ADD(${'LeaveEntitlement.startDate'}, INTERVAL ${timeZoneSetting} HOUR) <= CURDATE()`),
        literal(`CURDATE() <= DATE_ADD(${'LeaveEntitlement.endDate'}, INTERVAL ${timeZoneSetting} HOUR)`),
      ],
    }
  });

  if (lstLeaveEntitlement && lstLeaveEntitlement.length > 0) {
    lstLeaveEntitlement.map(leaveEntitlement => {
      var earnLeave = 0;
      if (leaveEntitlement?.User?.dateStartContract) {
        var dateStartContract = new Date(leaveEntitlement?.User?.dateStartContract);
        dateStartContract.setHours(dateStartContract.getHours() + timeZoneSetting);
      }
    });
  }
}

export {
  balanceLeaveEntitlementJob
}