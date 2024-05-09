import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'pie-chart-outline',
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
            icon: 'umbrella-outline',
            link: '/admin/leave-request',
          },
          {
            title: 'Leave Entitlement',
            icon: 'link-2-outline',
            link: '/admin/leave-entitlement',
          },
          {
            title: 'Leave Type',
            icon: 'funnel-outline',
            link: '/admin/leave-type',
          },
        ],
      },
      {
        title: 'Attendance',
        icon: 'sun-outline',
        children: [
          {
            title: 'Attendances',
            icon: 'smartphone-outline',
            link: '/admin/attendances',
          },
          {
            title: 'Reports',
            icon: 'shake-outline',
            link: '/admin/attendance-report',
          },
        ],
      },
      {
        title: 'Work Calendar',
        icon: 'calendar-outline',
        link: '/admin/work-calendar',
      },
      {
        title: 'Report Schedule',
        icon: 'pantone-outline',
        link: '/admin/report-schedule',
      },
    ],
  },
  {
    title: 'System',
    icon: 'settings-2-outline',
    children: [
      {
        title: 'Roles',
        icon: 'shield-outline',
        link: '/admin/roles',
      },
      {
        title: 'Settings',
        icon: 'options-2-outline',
        link: '/admin/settings',
      },
      {
        title: 'DataStates',
        icon: 'layers-outline',
        link: '/admin/data-state',
      },
    ],
  },
];
