import { CronJob } from 'cron';
import db from '../models/index.js';
import { leaveType } from '../models/enums/leaveType.js';
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
    if (checkExistThisYear === null || checkExistThisYear?.length <= 0) {
      await generationLeaveEntitlement();
    }
  },
  start: false,
  timeZone: 'Asia/Ho_Chi_Minh'
});

async function generationLeaveEntitlement() {
  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var lstEmployees = await dbContext.User.findAll();
  var annuallyType = await dbContext.LeaveType.findOne({
    where: {
      leaveTypeId: leaveType.ANNUALLY
    }
  });
  annuallyType = annuallyType?.dataValues;
  var seniorityType = await dbContext.LeaveType.findOne({
    where: {
      leaveTypeId: leaveType.SENIORITY
    }
  });
  seniorityType = seniorityType?.dataValues;
  var transferType = await dbContext.LeaveType.findOne({
    where: {
      leaveTypeId: leaveType.TRANSFER
    }
  });
  transferType = transferType?.dataValues;
  var unpaidType = await dbContext.LeaveType.findOne({
    where: {
      leaveTypeId: leaveType.UNPAID
    }
  });
  unpaidType = unpaidType?.dataValues;
  if (lstEmployees && lstEmployees?.length > 0) {
    try {
      lstEmployees.map(async employee => {
        // Create a annually entitlement
        await dbContext.LeaveEntitlement.create({
          userId: employee.userId,
          leaveTypeId: annuallyType.leaveTypeId,
          startDate: new Date(currentYear, annuallyType?.defaultStartMonth - 1, annuallyType?.defaultStartDay, 0, 0, 0),
          endDate: new Date(currentYear, annuallyType?.defaultEndMonth - 1, annuallyType?.defaultEndDay, 23, 59, 59),
          availableLeave: annuallyType?.defaultBudget ?? 0,
          usableLeave: 0,
          usedLeave: 0,
          effectedYear: currentYear
        })
        .then((res) => {})
        .catch((err) => {
          console.error(err);
        });
  
        // Create a seniority entitlement
        var differenceYear = calculateYearDifference(employee?.dateStartContract ? employee?.dateStartContract : currentDate, currentDate);
        var seniorityBudget = 0;
        if (differenceYear >= 5) {
          seniorityBudget = 5;
        } else if (differenceYear >= 3) {
          seniorityBudget = 3;
        }
        if (seniorityBudget > 0) {
          await dbContext.LeaveEntitlement.create({
            userId: employee.userId,
            leaveTypeId: seniorityType.leaveTypeId,
            startDate: new Date(currentYear, seniorityType?.defaultStartMonth - 1, seniorityType?.defaultStartDay, 0, 0, 0),
            endDate: new Date(currentYear, seniorityType?.defaultEndMonth - 1, seniorityType?.defaultEndDay, 23, 59, 59),
            availableLeave: seniorityType?.defaultBudget ?? 0,
            usableLeave: seniorityBudget,
            usedLeave: 0,
            effectedYear: currentYear
          })
          .then((res) => {})
          .catch((err) => {
            console.error(err);
          });
        }
  
        // Create a transfer entitlement
        var lstEmployeeEntitlements = await dbContext.LeaveEntitlement.findAll({
          where: {
            userId: employee.userId,
            effectedYear: currentYear - 1,
          },
          include: [
            {
              model: dbContext.LeaveType,
            }
          ],
        });
        if (lstEmployeeEntitlements && lstEmployeeEntitlements.length > 0) {
          var transferBudget = 0;
          lstEmployeeEntitlements.map(entitlement => {
            if (entitlement?.LeaveType?.isPaidSalary) {
              transferBudget += (entitlement.usableLeave - entitlement.usedLeave);
            }
          });
          if (transferBudget > 0) {
            await dbContext.LeaveEntitlement.create({
              userId: employee.userId,
              leaveTypeId: transferType.leaveTypeId,
              startDate: new Date(currentYear, transferType?.defaultStartMonth - 1, transferType?.defaultStartDay, 0, 0, 0),
              endDate: new Date(currentYear, transferType?.defaultEndMonth - 1, transferType?.defaultEndDay, 23, 59, 59),
              availableLeave: transferType?.defaultBudget ?? 0,
              usableLeave: transferType?.defaultBudget > transferBudget ? transferBudget : transferType?.defaultBudget,
              usedLeave: 0,
              effectedYear: currentYear
            })
            .then((res) => {})
            .catch((err) => {
              console.error(err);
            });
          }
        }
  
        // Create a unpaid entitlement
        await dbContext.LeaveEntitlement.create({
          userId: employee.userId,
          leaveTypeId: unpaidType.leaveTypeId,
          startDate: (new Date(currentYear, unpaidType?.defaultStartMonth - 1, unpaidType?.defaultStartDay, 0, 0, 0)),
          endDate: (new Date(currentYear, unpaidType?.defaultEndMonth - 1, unpaidType?.defaultEndDay, 23, 59, 59)),
          availableLeave: unpaidType?.defaultBudget,
          usableLeave: unpaidType?.defaultBudget,
          usedLeave: 0,
          effectedYear: currentYear
        })
        .then((res) => {})
        .catch((err) => {
          console.error(err);
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
}

function calculateYearDifference(date1, date2) {
  var timeDiff = Math.abs(date2.getTime() - date1.getTime());
  var yearsDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
  return yearsDiff;
}

export {
  generationLeaveEntitlementJob
}