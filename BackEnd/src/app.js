import express, { json } from 'express';
import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
import route from './routes/indexRoutes.js';
import { Sequelize } from 'sequelize';
import dbConfigs from './config/db.config.js';
import { generationLeaveEntitlementJob } from './cronJobs/generationLeaveEntitlementJobs.js';
import { balanceLeaveEntitlementJob } from './cronJobs/balanceLeaveEntitlementJobs.js';

//database connection
const sequelize = new Sequelize(
    dbConfigs.development
)
sequelize.authenticate()
    .then(() => {
        console.log('MSQL connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

//middleware
app.use(json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/assets/images',express.static('assets/images'));

//base route    
route(app);

// cron jobs
// outDateWork.start();
generationLeaveEntitlementJob.start();
balanceLeaveEntitlementJob.start();

export default app;

