'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [{
      userId: 'fa2e3df8-ab46-462d-8e13-25e07454142f',
      firstName: 'Ta',
      middleName: 'Duy',
      lastName: 'Hoang',
      email: 'taduyhoang10@gmail.com',
      birth: new Date(),
      gender: 'Male',
      password: '$2b$10$lpHbaPiZU7ofNwnlSXsRTOPauhAObEPL8XS12KTQF6v3w4kxGE4L2',
      nationality: 'VietNam',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date,
      deletedAt: null
    }], {});

    await queryInterface.bulkInsert('Roles', [{
      roleId: '7f2998a1-e145-415a-98a5-41e3a28dc943',
      roleName: 'admin',
      roleDescription: null,
      displayName: 'Admin',
      defaultScreen: '/home',
      priority: 0,
      isShow: true,
      createdAt: new Date(),
      updatedAt: new Date,
      deletedAt: null
    }], {});

    await queryInterface.bulkInsert('User_roles', [{
      roleId: '7f2998a1-e145-415a-98a5-41e3a28dc943',
      userId: 'fa2e3df8-ab46-462d-8e13-25e07454142f',
      createdAt: new Date(),
      updatedAt: new Date,
      deletedAt: null
    }], {});

    await queryInterface.bulkInsert('Users', [{
      userId: '6972735f-965b-44cb-bdb0-6262f62d83a8',
      firstName: 'Ngo',
      middleName: 'Anh',
      lastName: 'Lượng',
      email: 'luongna@gmail.com',
      birth: new Date(),
      gender: 'Male',
      password: '$2b$10$lpHbaPiZU7ofNwnlSXsRTOPauhAObEPL8XS12KTQF6v3w4kxGE4L2',
      nationality: 'VietNam',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date,
      deletedAt: null
    }], {});

    await queryInterface.bulkInsert('Roles', [{
      roleId: '7b6637d8-0515-49a6-8eb1-6c7b6ec4a2bf',
      roleName: 'employee',
      roleDescription: null,
      displayName: 'Employee',
      defaultScreen: '/employee',
      priority: 1,
      isShow: true,
      createdAt: new Date(),
      updatedAt: new Date,
      deletedAt: null
    }], {});

    await queryInterface.bulkInsert('User_roles', [{
      roleId: '7f2998a1-e145-415a-98a5-41e3a28dc943',
      userId: '6972735f-965b-44cb-bdb0-6262f62d83a8',
      createdAt: new Date(),
      updatedAt: new Date,
      deletedAt: null
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkDelete('User_roles', null, {});
  }
};
