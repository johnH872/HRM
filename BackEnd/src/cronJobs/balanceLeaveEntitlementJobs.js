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
  try {
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
      var currentDate = new Date();
      lstLeaveEntitlement.map(async leaveEntitlement => {
        var earnLeave = 0;
        if (leaveEntitlement?.User?.dateStartContract) {
          var dateStartContract = new Date(leaveEntitlement?.User?.dateStartContract);
          dateStartContract.setHours(dateStartContract.getHours() + timeZoneSetting);
          var startDate = new Date(leaveEntitlement?.startDate);
          startDate.setHours(startDate.getHours() + timeZoneSetting);
          var endDate = new Date(leaveEntitlement?.endDate);
          endDate.setHours(endDate.getHours() + timeZoneSetting);
          if (startDate.getTime() <= dateStartContract.getTime() && dateStartContract.getTime() <= endDate.getTime()) {
            if (currentDate.getTime() >= dateStartContract.getTime()) {
              earnLeave = currentDate.getMonth() - dateStartContract.getMonth();
              if (currentDate.getDate() === 31 && currentDate.getMonth() === 12) {
                currentDate.setDate(currentDate.getDate() + 1);
                earnLeave += 1;
              }
              if (currentDate.getDate() < dateStartContract.getDate()) {
                earnLeave -= 1;
              }
            }
          } else if (dateStartContract.getTime() < startDate.getTime()) {
            if (currentDate.getDate() === 31 && currentDate.getMonth() === 12) {
              earnLeave = calculateMonthDifference(startDate, startDate.setFullYear(startDate.getFullYear() + 1));
            } else {
              earnLeave = calculateMonthDifference(startDate, currentDate);
            }
            if (earnLeave > leaveEntitlement?.availableLeave) {
              earnLeave = leaveEntitlement?.usableLeave;
            }
          }
          await dbContext.LeaveEntitlement.update({
            usableLeave: earnLeave
          }, {
            where: {
              leaveEntitlementId: leaveEntitlement.leaveEntitlementId
            },
            returning: true,
            plain: true
          });
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
}

function calculateMonthDifference(startDate, endDate) {
  var monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  if (endDate.getDate() < startDate.getDate()) {
    monthDiff--;
  }
  return monthDiff;
}

export {
  balanceLeaveEntitlementJob
}