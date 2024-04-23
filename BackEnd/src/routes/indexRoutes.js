import authRoute from './authRoute.js';
import userRoute from './userRoute.js';
import employeeRoute from './employeeRoute.js';
import roleRoute from './roleRoute.js';
import mediaRoute from './mediaRoute.js';
import leaveTypeRoute from './leaveTypeRoute.js';
import leaveEntitlementRoute from './leaveEntitlementRoute.js';
import leaveRequestRoute from './leaveRequestRoute.js';
import dataStateRoute from './dataStateRoute.js';
import faceRecogRoute from './faceRecogRoute.js';
import attendanceRoute from './attendanceRoute.js';
import reportScheduleRoute from './reportScheduleRoute.js';
import settingRoute from './settingRoute.js';

const baseUrl = "/api"

function route(app) {
    app.use(`${baseUrl}/user`, userRoute);
    app.use(`${baseUrl}/auth`, authRoute);
    app.use(`${baseUrl}/DataStateManagement`, dataStateRoute);
    app.use(`${baseUrl}/EmployeeManagement`, employeeRoute);
    app.use(`${baseUrl}/RoleManagement`, roleRoute);
    app.use(`${baseUrl}/MediaManagement`, mediaRoute);
    app.use(`${baseUrl}/LeaveTypeManagement`, leaveTypeRoute);
    app.use(`${baseUrl}/LeaveEntitlementManagement`, leaveEntitlementRoute);
    app.use(`${baseUrl}/LeaveRequestManagement`, leaveRequestRoute);
    app.use(`${baseUrl}/FaceRecog`, faceRecogRoute);
    app.use(`${baseUrl}/AttendanceManagement`, attendanceRoute);
    app.use(`${baseUrl}/ReportScheduleManagement`, reportScheduleRoute);
    app.use(`${baseUrl}/SettingManagement`, settingRoute);
}
export default route;