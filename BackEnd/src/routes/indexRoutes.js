import authRoute from './authRoute.js';
import userRoute from './userRoute.js';
import employeeRoute from './employeeRoute.js';
import roleRoute from './roleRoute.js';
import mediaRoute from './mediaRoute.js';

const baseUrl = "/api"

function route(app) {
    app.use(`${baseUrl}/user`, userRoute);
    app.use(`${baseUrl}/auth`, authRoute);
    app.use(`${baseUrl}/EmployeeManagement`, employeeRoute);
    app.use(`${baseUrl}/RoleManagement`, roleRoute);
    app.use(`${baseUrl}/MediaManagement`, mediaRoute);
}
export default route;