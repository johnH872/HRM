'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'AttendanceReports',
      'reasonRejected', 
        {
          type: Sequelize.STRING
        },
    );

    await queryInterface.addColumn(
      'LeaveRequests',
      'reasonRejected', 
        {
          type: Sequelize.STRING
        },
    );

    await queryInterface.addColumn(
      'WorkCalendarDetails',
      'isReviewed', 
        {
          type: Sequelize.BOOLEAN
        },
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('AttendanceReports', 'reasonRejected');
    await queryInterface.removeColumn('LeaveRequests', 'reasonRejected');
    await queryInterface.removeColumn('WorkCalendarDetails', 'isReviewed');
  }
};
