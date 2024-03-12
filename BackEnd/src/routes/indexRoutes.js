import authRoute from './authRoute.js';
import userRoute from './userRoute.js';
import employeeRoute from './employeeRoute.js';
import roleRoute from './roleRoute.js';
import mediaRoute from './mediaRoute.js';
import leaveTypeRoute from './leaveTypeRoute.js';
import leaveEntitlementRoute from './leaveEntitlementRoute.js';

const baseUrl = "/api"

function route(app) {
    app.use(`${baseUrl}/user`, userRoute);
    app.use(`${baseUrl}/auth`, authRoute);
    app.use(`${baseUrl}/EmployeeManagement`, employeeRoute);
    app.use(`${baseUrl}/RoleManagement`, roleRoute);
    app.use(`${baseUrl}/MediaManagement`, mediaRoute);
    app.use(`${baseUrl}/LeaveTypeManagement`, leaveTypeRoute);
    app.use(`${baseUrl}/LeaveEntitlementManagement`, leaveEntitlementRoute);
}
export default route;