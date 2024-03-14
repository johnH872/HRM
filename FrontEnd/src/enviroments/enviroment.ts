export const host = 'http://localhost:5000';
export const apiUrl = `${host}/api`;

export const environment = {
    formatDateTime: 'MM/dd/yyyy HH:mm:ss',
    formatDateTimeZone: 'yyyy-MM-dd\'T\'HH:mm:ss x',
    formatDate: 'MM/dd/yyyy',
    formateHoursTime: 'HH:mm:ss',
    
    production: true,
    host,
    apiUrl,
    apiWorkManagement: apiUrl + '/work',
    apiAuth: apiUrl + '/auth',
    apiUser: apiUrl + '/user',
    apiLocation: apiUrl + '/location',
    apiDataStateManagement: apiUrl + '/dataState',
    apiPayment: apiUrl + '/payment',
    apiReport: apiUrl + '/report',

    apiEmployeeManagement: apiUrl + '/EmployeeManagement',
    apiRoleManagement: apiUrl + '/RoleManagement',
    apiLeaveTypeManagement: apiUrl + '/LeaveTypeManagement',
    apiLeaveEntitlementManagement: apiUrl + '/LeaveEntitlementManagement',
    apiLeaveRequestManagement: apiUrl + '/LeaveRequestManagement',
}