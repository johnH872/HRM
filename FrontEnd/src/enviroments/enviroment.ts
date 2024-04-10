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
    apiLocation: apiUrl + '/location',
    apiPayment: apiUrl + '/payment',
    apiReport: apiUrl + '/report',
    
    // API SYSTEM
    apiAuth: apiUrl + '/auth',
    apiUser: apiUrl + '/user',
    apiDataStateManagement: apiUrl + '/DataStateManagement',
    apiRoleManagement: apiUrl + '/RoleManagement',

    // API FEATURES
    apiEmployeeManagement: apiUrl + '/EmployeeManagement',
    apiLeaveTypeManagement: apiUrl + '/LeaveTypeManagement',
    apiLeaveEntitlementManagement: apiUrl + '/LeaveEntitlementManagement',
    apiLeaveRequestManagement: apiUrl + '/LeaveRequestManagement',
    apiFaceRecog: apiUrl + '/FaceRecog',
    apiMediaManagement: apiUrl + '/MediaManagement',
    apiAttendanceManagement: apiUrl + '/AttendanceManagement',
    apiReportScheduleManagement: apiUrl + '/ReportScheduleManagement',

    SOCKET_ENDPOINT: 'http://localhost:5000',
    FACE_MATCHER_MODEL_URL: 'http://res.cloudinary.com/dudtu2qef/raw/upload/v1712589621/traning_model/faceMatcher.json'
}