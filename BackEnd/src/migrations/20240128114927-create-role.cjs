'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles', {
      roleId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      roleName: {
        type: Sequelize.STRING
      },
      roleDescription: {
        type: Sequelize.STRING
      },
      displayName: {
        type: Sequelize.STRING
      },
      defaultScreen: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Roles');
  }
};