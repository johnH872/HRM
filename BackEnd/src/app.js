import express, { json } from 'express';
import 'dotenv/config';
import cors from 'cors';

const app = express();
import route from './routes/indexRoutes.js';
import { Sequelize } from 'sequelize';
import dbConfigs from './config/db.config.js';

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

//base route    
route(app);

// cron jobs
// outDateWork.start();

export default app;

