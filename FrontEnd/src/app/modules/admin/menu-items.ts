import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'shopping-cart-outline',
    link: '/admin/dashboard',
    home: true,
  },
  {
    title: 'FEATURES',
    children: [
      {
        title: 'Employees',
        icon: 'person-outline',
        link: '/admin/employee',
      },
      {
        title: 'Leave',
        icon: 'briefcase-outline',
        children: [
          {
            title: 'Leave Request',
            icon: 'briefcase-outline',
            link: '/admin/leave-request',
          },
          {
            title: 'Leave Entitlement',
            icon: 'briefcase-outline',
            link: '/admin/leave-entitlement',
          },
          {
            title: 'Leave Type',
            icon: 'briefcase-outline',
            link: '/admin/leave-type',
          },
        ],
      },
      {
        title: 'Attendance',
        icon: 'person-outline',
        link: '/admin/attendance',
      },
      {
        title: 'Calendar',
        icon: 'person-outline',
        link: '/admin/calendar',
      },
    ],
  },
  {
    title: 'System',
    children: [
      {
        title: 'DataStates',
        icon: 'bookmark-outline',
        link: '/admin/datastate',
      },
      {
        title: 'Roles',
        icon: 'bookmark-outline',
        link: '/admin/role',
      },
      {
        title: 'Permissions',
        icon: 'bookmark-outline',
        link: '/admin/permission',
      },
    ],
  },
  {
    title: 'Attendance',
    children: [
      {
        title: 'Punch In/Out',
        icon: 'checkmark-square-outline',
        link: '/admin/punch-in-out',
      }
    ],
  },
];
