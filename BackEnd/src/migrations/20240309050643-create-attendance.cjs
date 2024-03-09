'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Attendances', {
      attendanceId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.UUID
      },
      punchinDate: {
        type: Sequelize.DATE
      },
      punchinTime: {
        type: Sequelize.DOUBLE
      },
      punchinNote: {
        type: Sequelize.STRING
      },
      punchinOffset: {
        type: Sequelize.INTEGER
      },
      punchoutDate: {
        type: Sequelize.DATE
      },
      punchoutTime: {
        type: Sequelize.DOUBLE
      },
      punchoutNote: {
        type: Sequelize.STRING
      },
      punchoutOffset: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Attendances');
  }
};