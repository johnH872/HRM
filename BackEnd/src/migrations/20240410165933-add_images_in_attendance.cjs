'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Attendances',
      'punchInImageUrl', 
        {
          type: Sequelize.STRING
        },
    );

    await queryInterface.addColumn(
      'Attendances',
      'punchOutImageUrl', 
        {
          type: Sequelize.STRING
        },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Attendances', 'punchInImageUrl');
    await queryInterface.removeColumn('Attendances', 'punchOutImageUrl');
  }
};
