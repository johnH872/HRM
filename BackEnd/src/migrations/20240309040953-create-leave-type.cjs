'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LeaveTypes', {
      leaveTypeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      leaveTypeName: {
        type: Sequelize.STRING
      },
      defaultStartDay: {
        type: Sequelize.INTEGER
      },
      defaultStartMonth: {
        type: Sequelize.INTEGER
      },
      defaultEndDay: {
        type: Sequelize.INTEGER
      },
      defaultEndMonth: {
        type: Sequelize.INTEGER
      },
      defaultBudget: {
        type: Sequelize.INTEGER
      },
      isPaidSalary: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LeaveTypes');
  }
};