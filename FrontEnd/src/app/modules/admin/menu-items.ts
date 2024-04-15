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
    icon: 'bookmark-outline',
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
        icon: 'person-done-outline',
        children: [
          {
            title: 'Attendances',
            icon: 'checkmark-square-outline',
            link: '/admin/attendances',
          },
          {
            title: 'Reports',
            icon: 'alert-triangle-outline',
            link: '/admin/attendance-report',
          },
        ],
      },
      {
        title: 'Work Calendar',
        icon: 'person-outline',
        link: '/admin/calendar',
      },
      {
        title: 'Report Schedule',
        icon: 'person-outline',
        link: '/admin/report-schedule',
      },
    ],
  },
  {
    title: 'System',
    icon: 'settings-2-outline',
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
];
